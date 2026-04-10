import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { Hospital } from "../models/hospital.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { Appointment } from "../models/appointment.model.js";
import { LabAssistant } from "../models/labAssistant.model.js";
import { Receptionist } from "../models/receptionist.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//*************Admin login ********** */
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    throw new ApiError(404, "Admin record not found");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "This admin account is deactivated");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    admin._id,
    "admin",
  );

  const loggedInAdmin = await Admin.findById(admin._id)
    .populate("hospital")
    .select("-password -refreshToken");

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
          admin: loggedInAdmin,
          accessToken,
        },
        "Admin logged in successfully",
      ),
    );
});

//*************Admin logout ********** */
const logoutAdmin = asyncHandler(async (req, res) => {
  console.log(
    `Admin Logging Out: ${req.user?.fullName} (ID: ${req.user?._id})`,
  );

  await Admin.findByIdAndUpdate(
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
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

//--------------------CREATE ----------------------

//************** Create doctor ***********/
const generateUniqueDoctorId = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `DOC-${year}-${digits}`;
};

const generateScheduleId = () => {
  return `SCHED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const createDoctor = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    address,
    nid,
    emergencyContact, 
    licenseNumber,
    specialization,
    designation,
    degree,
    yearsExperience,
    consultationFee,
    sittingTimeLabel,
    workingDays,
    timeSlots,
  } = req.body;

  const requiredStrings = [
    fullName, email, password, phone, gender, 
    dateOfBirth, address, nid, licenseNumber, 
    specialization, sittingTimeLabel
  ];

  if (requiredStrings.some((f) => !f || f.toString().trim() === "")) {
    throw new ApiError(400, "All profile and availability fields are required");
  }

  if (consultationFee === undefined || consultationFee === null || consultationFee === "") {
    throw new ApiError(400, "Consultation fee is required");
  }

  let parsedEmergencyContact;
  try {
    parsedEmergencyContact = typeof emergencyContact === "string" 
      ? JSON.parse(emergencyContact) 
      : emergencyContact;
      
    if (!parsedEmergencyContact?.phone || parsedEmergencyContact.phone.trim() === "") {
      throw new Error();
    }
  } catch (error) {
    throw new ApiError(400, "Valid Emergency Contact phone is required");
  }

  let parsedWorkingDays = typeof workingDays === "string" ? JSON.parse(workingDays) : workingDays;
  let parsedTimeSlots = typeof timeSlots === "string" ? JSON.parse(timeSlots) : timeSlots;

  if (!Array.isArray(parsedWorkingDays) || parsedWorkingDays.length === 0) {
    throw new ApiError(400, "At least one working day is required");
  }
  
  if (!Array.isArray(parsedTimeSlots) || parsedTimeSlots.length === 0) {
    throw new ApiError(400, "At least one time slot is required");
  }
 
  const existedDoctor = await Doctor.findOne({
    $or: [{ email }, { licenseNumber }, { phone }],
  });

  if (existedDoctor) {
    throw new ApiError(409, "Doctor with this email, license, or phone already exists");
  }

  const photoLocalPath = req.file?.path;
  if (!photoLocalPath) throw new ApiError(400, "Doctor profile photo is required");

  const photo = await uploadOnCloudinary(photoLocalPath);
  if (!photo) throw new ApiError(500, "Error while uploading profile photo");

  const doctor = await Doctor.create({
    doctorId: generateUniqueDoctorId(),
    fullName,
    email,
    password,
    phone,
    gender: gender.toLowerCase(),
    dateOfBirth,
    address,
    nidNumber: nid,
    emergencyContact: {
      name: parsedEmergencyContact.name || "Emergency Contact",
      phone: parsedEmergencyContact.phone,
    },
    licenseNumber,
    specialization,
    designation,
    degree,
    yearsExperience: Number(yearsExperience) || 0,
    profilePhoto: {
      url: photo.url,
      publicId: photo.public_id,
    },
    hospital: req.user.hospital,
    createdByAdmin: req.user._id,
  });

  if (!doctor) {
    throw new ApiError(500, "Error while creating doctor account");
  }

  const schedule = await DoctorSchedule.create({
    scheduleId: generateScheduleId(),
    doctor: doctor._id,
    hospital: req.user.hospital,
    sittingTimeLabel,
    workingDays: parsedWorkingDays,
    consultationFee: Number(consultationFee) || 0,
    timeSlots: parsedTimeSlots,
  });

  if (!schedule) {
    await Doctor.findByIdAndDelete(doctor._id);
    if (photo.public_id) await deleteFromCloudinary(photo.public_id);
    throw new ApiError(500, "Error while creating doctor schedule");
  }

  const createdDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken");

  return res.status(201).json(
    new ApiResponse(201, { doctor: createdDoctor, schedule }, "Doctor account and schedule created successfully")
  );
});

//************** Create doctor assistant ********** */
const generateAssistantId = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `ASST-${year}-${digits}`;
};

const createDoctorAssistant = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    doctor,
    emergencyPhone,
    nidNumber,
    address,
  } = req.body;

  if (
    [fullName, email, password, phone, doctor, emergencyPhone].some(
      (f) => f?.trim() === "",
    )
  ) {
    throw new ApiError(
      400,
      "All profile fields and emergency phone are required",
    );
  }

  const existedAssistant = await DoctorAssistant.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedAssistant)
    throw new ApiError(
      409,
      "Assistant with this email or phone already exists",
    );

  const assistant = await DoctorAssistant.create({
    assistantId: generateAssistantId(),
    fullName,
    email,
    password,
    phone,
    gender: gender.toLowerCase(),
    dateOfBirth,
    address,
    nidNumber,
    emergencyContact: {
      name: "Emergency Contact",
      phone: emergencyPhone,
    },
    doctor,
    hospital: req.user.hospital,
    createdByAdmin: req.user._id,
  });

  if (!assistant) {
    throw new ApiError(
      500,
      "Internal Server Error: Failed to register assistant.",
    );
  }

  const createdAssistant = await DoctorAssistant.findById(assistant._id).select(
    "-password",
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdAssistant,
        "Doctor Assistant registered successfully",
      ),
    );
});

//************** Create lab assistant ********** */
const generateLabAssistantId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `LAB-ASST-${year}${randomDigits}`;
};

const createLabAssistant = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    emergencyPhone,
    nidNumber,
    address,
  } = req.body;

  if (
    [
      fullName,
      email,
      password,
      phone,
      gender,
      dateOfBirth,
      emergencyPhone,
    ].some((f) => !f || f.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All personal fields and emergency phone are required",
    );
  }

  const existedAssistant = await LabAssistant.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedAssistant) {
    throw new ApiError(409, "Lab Assistant already exists");
  }

  const labAssistant = await LabAssistant.create({
    labAssistantId: generateLabAssistantId(),
    fullName,
    email,
    password,
    phone,
    gender: gender.toLowerCase(),
    dateOfBirth,
    address,
    nidNumber,
    emergencyContact: {
      name: "Emergency Contact",
      phone: emergencyPhone,
    },
    hospital: req.user.hospital,
    createdByAdmin: req.user._id,
  });

  const createdAssistant = await LabAssistant.findById(labAssistant._id).select(
    "-password -refreshToken",
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdAssistant,
        "Lab Assistant registered successfully",
      ),
    );
});

//************** Create Receptionist ********** */
const generateReceptionistId = () => {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}${randomDigits}`;
};

const createReceptionist = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    emergencyPhone,
    nidNumber,
    address,
  } = req.body;

  if (
    [
      fullName,
      email,
      password,
      phone,
      gender,
      dateOfBirth,
      emergencyPhone,
    ].some((f) => !f || f.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All personal fields and emergency phone are required",
    );
  }

  const existedReceptionist = await Receptionist.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedReceptionist) {
    throw new ApiError(409, "Receptionist already exists");
  }

  const receptionist = await Receptionist.create({
    receptionistId: generateReceptionistId(),
    fullName,
    email,
    password,
    phone,
    gender: gender.toLowerCase(),
    dateOfBirth,
    address,
    nidNumber,
    emergencyContact: {
      name: "Emergency Contact",
      phone: emergencyPhone,
    },
    hospital: req.user.hospital,
    createdByAdmin: req.user._id,
  });

  const createdReceptionist = await Receptionist.findById(
    receptionist._id,
  ).select("-password -refreshToken");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdReceptionist,
        "Receptionist registered successfully",
      ),
    );
});

//-------------------- FETCH ----------------------
const getHospitalStaff = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const hospitalId = req.user.hospital;

  if (!role) {
    throw new ApiError(400, "Role query parameter is required");
  }

  let staffData = [];
  const query = { hospital: hospitalId };

  switch (role.toUpperCase()) {
    case "DOCTORS":
      staffData = await Doctor.find(query).select("-password -refreshToken");
      break;

    case "ASSISTANTS":
      staffData = await DoctorAssistant.find(query).select(
        "-password -refreshToken",
      );
      break;

    case "LAB STAFF":
      staffData = await LabAssistant.find(query).select(
        "-password -refreshToken",
      );
      break;

    case "RECEPTIONIST":
      staffData = await Receptionist.find(query).select(
        "-password -refreshToken",
      );
      break;

    default:
      throw new ApiError(400, "Invalid role selected");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, staffData, `${role} fetched successfully`));
});

//-------------------- DELETE ----------------------
const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;
  const hospitalId = req.user.hospital;

  if (!role) {
    throw new ApiError(400, "Role query parameter is required for deletion");
  }

  let Model;
  const normalizedRole = role.toUpperCase();

  switch (normalizedRole) {
    case "DOCTORS":
      Model = Doctor;
      break;
    case "ASSISTANTS":
      Model = DoctorAssistant;
      break;
    case "LAB STAFF":
      Model = LabAssistant;
      break;
    case "RECEPTIONIST":
      Model = Receptionist;
      break;
    default:
      throw new ApiError(400, "Invalid role provided");
  }

  const staffMember = await Model.findOne({ _id: id, hospital: hospitalId });

  if (!staffMember) {
    throw new ApiError(404, "Staff member not found or permission denied");
  }

  if (normalizedRole === "DOCTORS") {
    console.log(`Cascading delete started for Doctor: ${staffMember.fullName}`);

    await DoctorSchedule.deleteMany({ doctor: id });

    await Appointment.deleteMany({ doctor: id });

    await DoctorAssistant.deleteMany({ doctor: id });

    if (staffMember.profilePhoto?.publicId) {
      await deleteFromCloudinary(staffMember.profilePhoto.publicId);
    }

    console.log("Schedules, Appointments, Assistants, and Images cleared.");
  }

  await Model.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `${role} and all associated data (Schedules, Appointments, Assistants) removed successfully`,
      ),
    );
});

export {
  loginAdmin,
  logoutAdmin,
  createDoctor,
  createDoctorAssistant,
  createLabAssistant,
  createReceptionist,
  getHospitalStaff,
  deleteStaff,
};
