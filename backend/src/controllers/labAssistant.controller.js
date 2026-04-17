import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { LabAssistant } from "../models/labAssistant.model.js";
import { LabReport } from "../models/labReport.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//*************Lab Assistant login ********** */
const loginLabAssistant = asyncHandler(async (req, res) => {
  const { labAssistantId, password } = req.body;

  if (!labAssistantId || !password) {
    throw new ApiError(400, "Lab Assistant ID and password are required");
  }

  const labAssistant = await LabAssistant.findOne({ labAssistantId }).select(
    "+password",
  );

  if (!labAssistant) {
    throw new ApiError(401, "Invalid Lab Assistant ID or password");
  }
  const isPasswordValid = await labAssistant.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Lab Assistant ID or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    labAssistant._id,
    "lab_assistant",
  );

  const loggedInLabStaff = await LabAssistant.findById(labAssistant._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInLabStaff,
          token: accessToken,
        },
        "Lab Assistant logged in successfully",
      ),
    );
});

//*************Lab Assistant logout ********** */
const logoutLabAssistant = asyncHandler(async (req, res) => {
  console.log(
    `Lab Assistant Logging Out: ${req.user?.fullName} (ID: ${req.user?._id})`,
  );

  await LabAssistant.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Lab Assistant logged out successfully"));
});

//*************Get prioritized patient list for Diagnostic Dashboard  ********** */
const getLabDashboard = asyncHandler(async (req, res) => {
    const dashboardData = await LabReport.aggregate([
        { $match: { hospital: new mongoose.Types.ObjectId(req.user.hospital) } },
        {
            $group: {
                _id: "$patient",
                totalTests: { $sum: 1 },
                paidTests: { $sum: { $cond: ["$isPaid", 1, 0] } },
                dueTests: { $sum: { $cond: ["$isPaid", 0, 1] } }
            }
        },
        {
            $lookup: {
                from: "patients",
                localField: "_id",
                foreignField: "_id",
                as: "patientInfo"
            }
        },
        { $unwind: "$patientInfo" },
        {
            $project: {
                upid: "$patientInfo.upid",
                fullName: "$patientInfo.fullName",
                totalTests: 1,
                paidTests: 1,
                dueTests: 1,
                priority: { $cond: [{ $gt: ["$paidTests", 0] }, 1, 0] }
            }
        },
        { $sort: { priority: -1, fullName: 1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, dashboardData, "Diagnostic dashboard fetched successfully")
    );
});

//*************Securely upload report and update database ********** */
const uploadDiagnosticReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    const report = await LabReport.findById(reportId);
    if (!report) throw new ApiError(404, "Test record not found");

    if (!report.isPaid) {
        throw new ApiError(403, "Access Denied: Payment is DUE for this test. Cannot upload report.");
    }
    
    if (report.status === "completed" || report.reportFile?.url) {
        throw new ApiError(400, "Conflict: A report has already been uploaded for this test.");
    }

    if (!req.file) {
        throw new ApiError(400, "Diagnostic report file (PDF/JPG/PNG) is required");
    }

    const uniqueFileName = `${report.reportId}_${Date.now()}`;

    const uploadResult = await uploadOnCloudinary(req.file.path, uniqueFileName);
    
    if (!uploadResult) {
        throw new ApiError(500, "Cloudinary upload failed");
    }

    try {
        report.reportFile = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: uploadResult.bytes,
        };
        report.status = "completed"; 
        report.labAssistant = req.user._id; 
        report.reportDate = new Date(); 

        await report.save();

        return res.status(200).json(
            new ApiResponse(200, report, "Success: Report uploaded and test marked as completed")
        );
    } catch (error) {
        if (uploadResult?.public_id) {
            const isPdf = req.file.mimetype === "application/pdf";
            await deleteFromCloudinary(uploadResult.public_id, isPdf ? "raw" : "image");
        }
        throw new ApiError(500, error?.message || "Internal Server Error: Failed to save record details.");
    }
});

//************* Get all tests for a specific patient ********** */
const getPatientTests = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    const reports = await LabReport.find({ 
        patient: patientId,
        hospital: req.user.hospital 
    }).populate("patient", "fullName upid");

    if (!reports || reports.length === 0) {
        throw new ApiError(404, "No tests found for this patient");
    }

    return res.status(200).json(
        new ApiResponse(200, reports, "Patient tests retrieved successfully")
    );
});

export {
   loginLabAssistant,
   logoutLabAssistant, 
   getLabDashboard, 
   uploadDiagnosticReport,
   getPatientTests 
  };
