import { Prescription } from "../models/prescription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const generatePrescriptionId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PR-${year}${randomDigits}`;
};

// ********************PATIENT PRESCRIPTION CONTROLLERS********************
//************** Add Patient Prescription ********** */
const addPatientPrescription = asyncHandler(async (req, res) => {
  //steps:
  //1. Verify JWT and ensure the user is a patient
  //2. Validate incoming data
  //3. Upload prescription file to Cloudinary
  //4. Create a new Prescription object and save it to the database
  //5. Return success response with the created prescription data
  if (req.user?.role !== "patient" && req.role !== "patient") {
    throw new ApiError(403, "Only patients can upload to the Health Vault");
  }

  const { manualDoctorName, manualHospitalName } = req.body;

  if (!manualDoctorName?.trim() || !manualHospitalName?.trim()) {
    throw new ApiError(400, "Doctor name and Hospital name are both required");
  }
  
  if (!req.file) {
    throw new ApiError(400, "Prescription file is required");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);
  if (!uploadResult) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  try {
    const prescription = await Prescription.create({
      prescriptionId: generatePrescriptionId(),
      patient: req.user._id,
      manualDoctorName: manualDoctorName.trim(),
      manualHospitalName: manualHospitalName.trim(),
      diagnosis: "General Health Record",
      advice: "N/A",
      requiredTests: [],
      prescribedDate: Date.now(),
      source: "imported",
      prescriptionFile: {
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
        new ApiResponse(201, prescription, "Prescription saved successfully"),
      );
  } catch (error) {
    if (uploadResult?.public_id) {
      await deleteFromCloudinary(uploadResult.public_id);
    }
    throw new ApiError(500, error?.message || "Failed to save to database");
  }
});

//************** Delete Prescription ********** */
const deletePrescription = asyncHandler(async (req, res) => {
  //steps:
  //1. Verify JWT and get patient ID from token
  //2. Get prescription ID from request params
  //3. Fetch the prescription first to check ownership
  //4. Compare the 'patient' field in the DB with the 'id' of the logged-in user. If they don't match, throw a 403 error.
  //5. If ownership is verified, delete the file from Cloudinary
  //6. Finally, remove the record from the database
  //7. Return success response confirming deletion
  const { id } = req.params;

  const prescription = await Prescription.findById(id);

  if (!prescription) {
    throw new ApiError(404, "Prescription record not found");
  }

  if (prescription.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Security Violation: You can only delete your own prescriptions.",
    );
  }

  if (prescription.prescriptionFile?.public_id) {
    const isPdf = prescription.prescriptionFile.mimeType === "application/pdf";

    await deleteFromCloudinary(
      prescription.prescriptionFile.public_id,
      isPdf ? "raw" : "image",
    );
  }

  await Prescription.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Prescription permanently deleted from your Vault",
      ),
    );
});

//************** Universal Get Patient Prescriptions  ********** */
const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const allowedRoles = ["patient", "doctor", "labAssistant"];
  const userRole = req.user?.role;
  const userId = req.user?._id;

  if (!allowedRoles.includes(userRole)) {
    throw new ApiError(
      403,
      "Access Denied: You do not have permission to view medical records.",
    );
  }

  const targetId = req.params.patientId || userId;

  if (userRole === "patient" && targetId.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Access Denied: You are only authorized to view your own prescriptions",
    );
  }

  const prescriptions = await Prescription.find({ patient: targetId })
    .sort({ prescribedDate: -1 })
    .populate("hospital", "fullName")
    .populate("doctor", "fullName");

  return res
    .status(200)
    .json(
      new ApiResponse(200, prescriptions, "Records retrieved successfully"),
    );
});

export { generatePrescriptionId,addPatientPrescription, deletePrescription, getPatientPrescriptions };
