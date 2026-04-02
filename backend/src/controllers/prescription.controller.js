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
  //1. Verify JWT and get patient ID from token (handled by auth middleware)
  //2. Get prescription details from request body
  //3. Validate that all fields are provided and valid
  //4. Handle file upload to Cloudinary and get the file URL
  //5. Create a new Prescription document in MongoDB with the provided details and file URL
  //6. Return success response with the created prescription data
  if (req.user.role !== "patient") {
    throw new ApiError(403, "Only patients can upload to the Health Vault");
  }

  const {
    diagnosis,
    manualDoctorName,
    manualHospitalName,
    prescribedDate,
    advice,
  } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Prescription file is required");
  }

  const uploadResult = await uploadOnCloudinary(req.file.path);
  if (!uploadResult) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  const prescription = await Prescription.create({
    prescriptionId: generatePrescriptionId(),
    patient: req.user._id,

    diagnosis:
      diagnosis && diagnosis.trim() !== ""
        ? diagnosis
        : "General Health Record",

    advice: advice || "",
    manualDoctorName: manualDoctorName || "Unknown Doctor",
    manualHospitalName: manualHospitalName || "Private Clinic/Hospital",
    prescribedDate: prescribedDate || Date.now(),
    source: "imported",

    prescriptionFile: {
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
        prescription,
        "Prescription added to your Health Vault",
      ),
    );
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

  if (prescription.prescriptionFile?.url) {
    await deleteFromCloudinary(prescription.prescriptionFile.url);
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

//************** Get Patient Prescriptions ********** */
const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const targetId = req.params.patientId || req.user._id;

  if (
    req.user.role === "patient" &&
    req.params.patientId &&
    req.params.patientId !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "You are only authorized to view your own prescriptions",
    );
  }

  const prescriptions = await Prescription.find({ patient: targetId })
    .sort({ prescribedDate: -1 })
    .populate("hospital", "name")
    .populate("doctor", "fullName");

  return res
    .status(200)
    .json(
      new ApiResponse(200, prescriptions, "Records retrieved successfully"),
    );
});

export { addPatientPrescription, deletePrescription, getPatientPrescriptions };
