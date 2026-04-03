import { LabReport } from "../models/labReport.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const generateReportId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `REP-${year}${randomDigits}`;
};

// ********************PATIENT LAB REPORT CONTROLLERS********************
//************** Add Patient Lab Report ********** */
const addPatientLabReport = asyncHandler(async (req, res) => {
  const userRole = req.user?.role || req.role;
  if (userRole !== "patient") {
    throw new ApiError(403, "Only patients can upload to the Health Vault");
  }

  const { testName, manualHospitalName } = req.body;

  if (!testName?.trim() || !manualHospitalName?.trim()) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    throw new ApiError(400, "Test name and Hospital name are both required");
  }

  if (!req.file) {
    throw new ApiError(400, "Lab report file is required");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);
  if (!uploadResult) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  try {
    const labReport = await LabReport.create({
      reportId: generateReportId(),
      patient: req.user._id,
      testName: testName.trim(),
      testType: "Other",
      manualHospitalName: manualHospitalName.trim(),
      reportDate: Date.now(),
      source: "imported",
      price: 0,
      isPaid: true,
      reportFile: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: uploadResult.bytes,
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          labReport,
          "Lab report added to your Health Vault",
        ),
      );
  } catch (error) {
    if (uploadResult?.public_id) {
      const isPdf = req.file.mimetype === "application/pdf";
      await deleteFromCloudinary(
        uploadResult.public_id,
        isPdf ? "raw" : "image",
      );
    }
    throw new ApiError(
      500,
      error?.message || "Failed to save report to database",
    );
  }
});

//**************** DELETE LAB REPORT ************/
const deletePatientLabReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const report = await LabReport.findById(id);

  if (!report) {
    throw new ApiError(404, "Report record not found");
  }

  if (report.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Security Violation: Unauthorized deletion.");
  }

  if (report.reportFile?.public_id) {
    const isPdf = report.reportFile.mimeType === "application/pdf";

    await deleteFromCloudinary(
      report.reportFile.public_id,
      isPdf ? "raw" : "image",
    );
  }

  await LabReport.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Report permanently deleted"));
});

//*********** *Universal Get Patient Lab Reports  ********** */
const getPatientLabReports = asyncHandler(async (req, res) => {
  const allowedRoles = ["patient", "doctor", "labAssistant"];
  const userRole = req.user?.role;
  const userId = req.user?._id;

  if (!allowedRoles.includes(userRole)) {
    throw new ApiError(
      403,
      "Access Denied: Admins and unauthorized roles cannot view the Health Vault.",
    );
  }

  const targetId = req.params.patientId || userId;

  if (userRole === "patient" && targetId.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Access Denied: Patients can only view their own records.",
    );
  }

  const reports = await LabReport.find({ patient: targetId })
    .sort({ reportDate: -1 })
    .populate("hospital", "fullName")
    .populate("labAssistant", "fullName");

  return res
    .status(200)
    .json(new ApiResponse(200, reports, "Lab reports retrieved successfully"));
});

export { addPatientLabReport, deletePatientLabReport, getPatientLabReports };
