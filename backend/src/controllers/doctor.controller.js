import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Patient } from "../models/patient.model.js";
import { Prescription } from "../models/prescription.model.js";
import { generatePrescriptionId } from "../controllers/prescription.controller.js";
import { LabReport } from "../models/labReport.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//*************Doctor login ********** */
const loginDoctor = asyncHandler(async (req, res) => {
  const { doctorId, password } = req.body;

  if (!doctorId || !password) {
    throw new ApiError(400, "Doctor ID and password are required");
  }

  const doctor = await Doctor.findOne({ doctorId });

  if (!doctor) {
    throw new ApiError(404, "Invalid Practitioner Credentials (ID not found)");
  }

  const isPasswordValid = await doctor.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid Practitioner Credentials (Wrong Password)",
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    doctor._id,
    "doctor",
  );

  const loggedInDoctor = await Doctor.findById(doctor._id).select(
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
          doctor: loggedInDoctor,
          token: accessToken,
        },
        "Doctor logged in successfully",
      ),
    );
});

//*************Doctor logout ********** */
const logoutDoctor = asyncHandler(async (req, res) => {
  console.log(
    `Doctor Logging Out: ${req.user?.fullName} (ID: ${req.user?._id})`,
  );

  await Doctor.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
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
    .json(new ApiResponse(200, {}, "Doctor logged out successfully"));
});

//**************Fetch Todays Appointments*********** */
const getTodayAppointments = asyncHandler(async (req, res) => {
  const now = new Date();
  const dhakaDate = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka",
  });
  const today = new Date(`${dhakaDate}T00:00:00.000Z`);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);
  
  const queue = await Appointment.aggregate([
    {
      $match: {
        doctor: new mongoose.Types.ObjectId(req.user._id),
        hospital: new mongoose.Types.ObjectId(req.user.hospital),
        appointmentDate: { $gte: today, $lt: tomorrow },
        bookingStatus: "scheduled",
      },
    },
    {
      $lookup: {
        from: "patients",
        localField: "patient",
        foreignField: "_id",
        as: "patientDetails",
      },
    },
    {
      $addFields: {
        patient: { $first: "$patientDetails" },
        sortPriority: {
          $cond: {
            if: { $eq: ["$appointmentType", "follow_up"] },
            then: 0,
            else: 1,
          },
        },
      },
    },
    {
      $sort: { sortPriority: 1, serialNumber: 1 },
    },
    {
      $project: {
        _id: 1,
        serialNumber: 1,
        appointmentType: 1,
        queueStatus: 1,
        "patient.fullName": 1,
        "patient.upid": 1,
        "patient.profilePhoto": 1,
        "patient.gender": 1,
        "patient.age": 1,
      },
    },
  ]);

  if (!queue || queue.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "The consultation queue is currently empty."),
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        queue,
        "Today's consultation queue fetched successfully.",
      ),
    );
});

//******************* Verify Patient ************** */
const verifyPatientStart = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId).populate({
    path: "patient",
    select: "fullName upid profilePhoto gender age",
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.doctor.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to view this patient's details",
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patient: appointment.patient,
        appointmentId: appointment._id,
        serialNumber: appointment.serialNumber,
      },
      "Patient verification data loaded",
    ),
  );
});

//******************Yes: Start Consultation Session*********** */
const startConsultationSession = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    doctor: req.user._id,
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found or you are not authorized.");
  }

  appointment.queueStatus = "in_consultation";

  await appointment.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { appointmentId: appointment._id, status: appointment.queueStatus },
        "Consultation session started. Assistant dashboard updated.",
      ),
    );
});

//****************** Get Patients Details********** */
const getPatientProfileForDoctor = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  let patient = await Patient.findOne({
    upid: patientId.toUpperCase().trim(),
  }).select("-password -refreshToken");

  if (!patient) {
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId).select(
        "-password -refreshToken",
      );
    }
  }

  if (!patient) throw new ApiError(404, "Patient not found");

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "Patient profile fetched"));
});

//**************** Upload Prescription ************/
const createDigitalPrescription = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { diagnosis, medications, advice, requiredTests } = req.body;

  const appointment = await Appointment.findById(appointmentId)
    .populate("patient")
    .populate("doctor")
    .populate("hospital");

  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.doctor._id.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You can only sign prescriptions for your own appointments",
    );
  }

  const prescription = await Prescription.create({
    prescriptionId: generatePrescriptionId(),
    patient: appointment.patient._id,
    doctor: appointment.doctor._id,
    hospital: appointment.hospital._id,
    appointment: appointment._id,

    manualDoctorName: appointment.doctor.fullName,
    manualHospitalName: appointment.hospital.fullName,

    diagnosis: diagnosis || "Consultation",
    medications: medications,
    advice: advice,
    requiredTests: requiredTests,

    source: "doctor",
    prescribedDate: new Date(),
  });

  appointment.hasDigitalPrescription = true;
  await appointment.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        prescription,
        patientId: appointment.patient._id,
        appointmentId: appointment._id,
      },
      "Prescription saved successfully",
    ),
  );
});

export {
  loginDoctor,
  logoutDoctor,
  getTodayAppointments,
  verifyPatientStart,
  startConsultationSession,
  getPatientProfileForDoctor,
  createDigitalPrescription,
};
