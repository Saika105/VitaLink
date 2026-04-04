import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { Patient } from "../models/patient.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";
import { Prescription } from "../models/prescription.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//*************Doctor Assistant login ********** */
const loginAssistant = asyncHandler(async (req, res) => {
  const { assistantId, password } = req.body;

  if (!assistantId || !password) {
    throw new ApiError(400, "Assistant ID and password are required");
  }

  const assistant = await DoctorAssistant.findOne({ assistantId }).select(
    "+password",
  );

  if (!assistant) {
    throw new ApiError(404, "Invalid Practitioner Credentials (ID not found)");
  }

  const isPasswordValid = await assistant.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid Practitioner Credentials (Wrong Password)",
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    assistant._id,
    "doctor_assistant",
  );

  const loggedInAssistant = await DoctorAssistant.findById(assistant._id)
    .select("-password -refreshToken")
    .populate("doctor", "fullName email"); // Helpful to know which doctor they work for

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
          user: loggedInAssistant,
          token: accessToken,
        },
        "Assistant logged in successfully",
      ),
    );
});

//*************Doctor Assistant logout ********** */
const logoutAssistant = asyncHandler(async (req, res) => {
  console.log(
    `Assistant Logging Out: ${req.user?.fullName} (ID: ${req.user?._id})`,
  );

  await DoctorAssistant.findByIdAndUpdate(
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
    .json(new ApiResponse(200, {}, "Assistant logged out successfully"));
});

//****************************APPOINTMENT PART STARTS********************* */
const generateAppointmentId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generates exactly 4 digits
  return `APPT-${year}${randomDigits}`;
};

//**************search patient by UPID ******************/
const searchPatientByUPID = asyncHandler(async (req, res) => {
  const { upid } = req.params;

  if (!upid) {
    throw new ApiError(400, "Please enter a Patient Unique ID");
  }

  const patient = await Patient.findOne({
    upid: upid.toUpperCase().trim(),
  }).select("fullName upid phone gender");

  if (!patient) {
    throw new ApiError(
      404,
      "Patient not found. Check ID or Register new patient.",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "Patient profile match found"));
});

//**************Add appointment ******************/
const addAppointmentToQueue = asyncHandler(async (req, res) => {
  //steps:
  //1. Get patient ID from request body
  //2. Validate patient exists
  //3. Get today's date and count how many appointments doctor already has today to determine next serial number
  //4. Get doctor's schedule to determine time slot (for simplicity, we will assign the first time slot of the day)
  //5. Create new appointment with status "scheduled" and queueStatus "pending"
  //6. Add new appointment to queue with current timestamp
  const { patientId } = req.body;

  if (!patientId) {
    throw new ApiError(400, "Patient ID is required to add to queue");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const dailyCount = await Appointment.countDocuments({
    doctor: req.user.doctor,
    hospital: req.user.hospital,
    appointmentDate: { $gte: today, $lte: endOfToday },
  });
  const nextSerial = dailyCount + 1;

  const schedule = await DoctorSchedule.findOne({
    doctor: req.user.doctor,
    hospital: req.user.hospital,
  });

  if (!schedule) {
    throw new ApiError(404, "Doctor schedule not found for this hospital.");
  }

  const arrivalTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const appointment = await Appointment.create({
    appointmentId: generateAppointmentId(),
    patient: patientId,
    doctor: req.user.doctor,
    hospital: req.user.hospital,
    addedToQueueByAssistant: req.user._id,
    appointmentDate: today,
    serialNumber: nextSerial,
    arrivalTime: arrivalTime,
    timeSlot: schedule.timeSlots[0],
    bookingStatus: "scheduled",
    queueStatus: "pending",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        appointment,
        "Patient successfully added to daily queue",
      ),
    );
});

export {
  loginAssistant,
  logoutAssistant,
  searchPatientByUPID,
  addAppointmentToQueue,
};
