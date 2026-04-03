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
  if (req.role !== "patient") {
    throw new ApiError(403, "Only patients can upload to the Health Vault");
  }

  const {
    testName,
    manualHospitalName,
  } = req.body;

  if (!testName || !manualHospitalName) {
    throw new ApiError(400, "Test name and Hospital name are required");
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
      testName: testName?.trim() || "General Lab Report",
      testType: testType || "Other",
      manualHospitalName: manualHospitalName || "Private Hospital",
      reportDate: reportDate || Date.now(),
      source: "imported",
      price: 0,
      isPaid: true,
      reportFile: {
        url: uploadResult.secure_url,
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
    await deleteFromCloudinary(uploadResult.secure_url);
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
    throw new ApiError(
      403,
      "Security Violation: You are not authorized to delete this record.",
    );
  }

  if (report.reportFile?.url) {
    await deleteFromCloudinary(report.reportFile.url);
  }

  await LabReport.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Report permanently deleted"));
});

//*********** *Universal Get Patient Lab Reports  ********** */
const getPatientLabReports = asyncHandler(async (req, res) => {
  const targetId = req.params.patientId || req.user._id;

  if (req.user.role === "patient" && targetId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access Denied: Patients can only view their own vault.");
  }
  
  const reports = await LabReport.find({ patient: targetId })
    .sort({ reportDate: -1 })
    .populate("hospital", "fullName")
    .populate("labAssistant", "fullName");

  return res.status(200).json(
    new ApiResponse(200, reports, "Lab reports retrieved successfully")
  );
});

export { addPatientLabReport , deletePatientLabReport , getPatientLabReports };
