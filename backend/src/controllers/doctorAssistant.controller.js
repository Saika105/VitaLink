import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { Patient } from "../models/patient.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";
import { Prescription } from "../models/prescription.model.js";
import { generatePrescriptionId } from "../controllers/prescription.controller.js";
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
    .populate("doctor", "fullName email");

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
          role: "doctor_assistant",
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

  const patientRecord = await Patient.findOne({
    upid: patientId.toUpperCase(),
  });

  if (!patientRecord) {
    throw new ApiError(404, "Patient with this ID does not exist");
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const alreadyInQueue = await Appointment.findOne({
    patient: patientRecord._id,
    doctor: req.user.doctor,
    hospital: req.user.hospital,
    appointmentDate: { $gte: today, $lte: endOfToday },
    bookingStatus: "scheduled",
    appointmentType: { $ne: "follow_up" },
  });

  if (alreadyInQueue) {
    throw new ApiError(400, "This patient is already in today's queue.");
  }

  const lastAppointment = await Appointment.findOne({
    doctor: req.user.doctor,
    hospital: req.user.hospital,
    appointmentDate: { $gte: today, $lte: endOfToday },
  })
    .sort({ serialNumber: -1 })
    .select("serialNumber");

  const nextSerial = lastAppointment ? lastAppointment.serialNumber + 1 : 1;

  const schedule = await DoctorSchedule.findOne({
    doctor: req.user.doctor,
    hospital: req.user.hospital,
  });

  if (!schedule) {
    throw new ApiError(404, "Doctor schedule not found for this hospital.");
  }

  const arrivalTime = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const appointment = await Appointment.create({
    appointmentId: generateAppointmentId(),
    patient: patientRecord._id,
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

//***************Fetch That Days Queue For Assistant Table******* */
const getDailyAppointmentList = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dailyQueue = await Appointment.aggregate([
    {
      $match: {
        doctor: new mongoose.Types.ObjectId(req.user.doctor),
        hospital: new mongoose.Types.ObjectId(req.user.hospital),
        appointmentDate: {
          $gte: today,
          $lt: tomorrow,
        },
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
          $cond: [{ $eq: ["$appointmentType", "follow_up"] }, 0, 1],
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
        arrivalTime: 1,
        queueStatus: 1,
        appointmentType: 1,
        followUpDate: 1,
        "patient.fullName": 1,
        "patient.upid": 1,
        "patient.gender": 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, dailyQueue, "Daily queue synchronized"));
});

//*********Update Queue Status For Specific Appointment********** */
const updateQueueStatus = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  const updateData = { queueStatus: status };

  if (status === "completed" || status === "done") {
    updateData.bookingStatus = "completed";
  }

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      doctor: req.user.doctor,
      hospital: req.user.hospital,
    },
    { $set: updateData },
    { new: true },
  );

  if (!appointment)
    throw new ApiError(404, "Appointment not found or unauthorized");

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, `Status updated to ${status}`));
});

//******************Add Prescription by Assistant*************** */
const uploadPrescriptionByAssistant = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { diagnosis, advice } = req.body;

  const appointment = await Appointment.findById(appointmentId)
    .populate("patient")
    .populate("doctor")
    .populate("hospital");

  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.doctor._id.toString() !== req.user.doctor.toString()) {
    throw new ApiError(403, "Not authorized for this doctor's patients");
  }

  let uploadResult = null;
  if (req.file) {
    uploadResult = await uploadOnCloudinary(req.file.path);
  }

  const prescription = await Prescription.create({
    prescriptionId: generatePrescriptionId(),
    patient: appointment.patient._id,
    doctor: appointment.doctor._id,
    hospital: appointment.hospital._id,
    appointment: appointment._id,
    uploadedByAssistant: req.user._id,
    manualDoctorName: appointment.doctor.fullName,
    manualHospitalName: appointment.hospital.fullName,
    diagnosis: diagnosis || "Consultation",
    advice: advice || "Follow doctor's instructions",
    requiredTests: [],
    source: "doctor_assistant",
    prescribedDate: new Date(),
    prescriptionFile: uploadResult
      ? {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        }
      : null,
  });

  await appointment.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { prescription },
        "Prescription uploaded successfully",
      ),
    );
});

// *******************Clear Daily Queue ********************* */
const clearDailyQueue = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const result = await Appointment.updateMany(
    {
      doctor: req.user.doctor,
      hospital: req.user.hospital,
      appointmentDate: { $gte: today, $lte: endOfToday },
      bookingStatus: "scheduled",
    },
    {
      $set: {
        bookingStatus: "cancelled",
        queueStatus: "missed",
        cancellationReason: "System cleared at end of shift",
      },
    },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { modifiedCount: result.modifiedCount },
        `Shift ended. ${result.modifiedCount} no-shows moved to Canceled tab.`,
      ),
    );
});

// ************** Schedule Follow-Up Appointment ********** */
const scheduleFollowUp = asyncHandler(async (req, res) => {
  //steps:
  //1. Get appointment ID from params and followUpDate from body
  //2. Validate appointment exists and belongs to this Assistant's Doctor
  //3. Validate followUpDate is in the future
  //4. Validate followUpDate is not already scheduled for this patient and doctor
  //5. Count how many FOLLOW-UPS already exist for that future date to determine new serial number
  //6. RE-SHUFFLE ONLY REGULAR PATIENTS: We only increment serials for patients who are NOT follow-ups OR whose serial is >= our new position.
  //7. Create the New Future Appointment with type "follow_up"
  //8. Update current record with followUpDate
  //9. Return success response
  const { appointmentId } = req.params;
  const { followUpDate } = req.body;

  const currentAppt = await Appointment.findById(appointmentId);
  if (!currentAppt) throw new ApiError(404, "Original appointment not found");

  const futureDate = new Date(followUpDate);
  futureDate.setHours(0, 0, 0, 0);

  // if (futureDate <= new Date().setHours(0, 0, 0, 0)) {
  //   throw new ApiError(400, "Follow-up date must be a future date.");
  // }

  const existingEntry = await Appointment.findOne({
    patient: currentAppt.patient,
    doctor: currentAppt.doctor,
    appointmentDate: futureDate,
    bookingStatus: "scheduled",
  });

  if (existingEntry) {
    throw new ApiError(400, "A follow-up is already scheduled for this date.");
  }

  const existingFollowUpCount = await Appointment.countDocuments({
    doctor: currentAppt.doctor,
    hospital: currentAppt.hospital,
    appointmentDate: futureDate,
    appointmentType: "follow_up",
  });

  const newFollowUpSerial = existingFollowUpCount + 1;

  const followUpAppt = await Appointment.create({
    appointmentId: generateAppointmentId(),
    patient: currentAppt.patient,
    doctor: currentAppt.doctor,
    hospital: currentAppt.hospital,
    appointmentDate: futureDate,
    serialNumber: newFollowUpSerial,
    timeSlot: currentAppt.timeSlot,
    appointmentType: "follow_up",
    bookingStatus: "scheduled",
    queueStatus: "pending",
    reasonForVisit: `Follow-up for ${currentAppt.appointmentId}`,
  });

  currentAppt.followUpDate = futureDate;
  await currentAppt.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        followUpAppt,
        `Follow-up Serial #${newFollowUpSerial} booked for ${followUpDate}`,
      ),
    );
});

const checkInPatient = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      $set: {
        arrivalTime: currentTime,
        queueStatus: "pending",
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Patient checked in"));
});

export {
  loginAssistant,
  logoutAssistant,
  searchPatientByUPID,
  addAppointmentToQueue,
  getDailyAppointmentList,
  updateQueueStatus,
  uploadPrescriptionByAssistant,
  clearDailyQueue,
  scheduleFollowUp,
  checkInPatient,
};
