import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";
import { Appointment } from "../models/appointment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Utility function to generate a unique patient ID
const generateUniquePatientId = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `PT-${year}-${digits}`;
};

//*********************register patient*****************
const initializeRegistration = asyncHandler(async (req, res) => {
  //  steps
  // Extract and validate required fields from the request body
  // Age Calculation Logic
  // Conditional ID Validation (Adult vs Minor)
  // Check for existing user
  // Generate Unique Patient ID
  // Create Patient in DB
  // Send PT-ID back to frontend for the popup
  const {
    name,
    email,
    phone,
    dob,
    nid,
    birthCertificate,
    gender,
    address,
    bloodGroup,
    emergencyContact,
  } = req.body;

  if ([name, email, phone, dob, gender].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Required profile information is missing.");
  }

  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  let finalNid;
  let finalBirthCert;
  if (age >= 18) {
    if (!nid) throw new ApiError(400, "NID is required for adults (18+).");
    finalNid = nid;
  } else {
    if (!birthCertificate)
      throw new ApiError(400, "Birth Certificate is required for minors.");
    finalBirthCert = birthCertificate;
  }

  const existedPatient = await Patient.findOne({
    $or: [
      { email },
      { phone },
      finalNid ? { nidNumber: finalNid } : { birthCertificate: finalBirthCert },
    ].filter(Boolean),
  });

  if (existedPatient) {
    throw new ApiError(
      409,
      "A patient with this Email, Phone, or Identity Number already exists.",
    );
  }

  const upid = generateUniquePatientId();

  const patient = await Patient.create({
    upid,
    fullName: name,
    email,
    phone,
    dateOfBirth: dob,
    nidNumber: finalNid,
    birthCertificate: finalBirthCert,
    gender: gender.toLowerCase(),
    address,
    bloodGroup,
    emergencyContact: {
      name: "Emergency Contact",
      phone: emergencyContact,
    },
    password: "TEMP_PASS_" + Math.random().toString(36).slice(-8), // Placeholder
    isActive: false,
  });

  if (!patient) {
    throw new ApiError(
      500,
      "Something went wrong while saving the patient record.",
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { uniqueId: patient.upid },
        "Identity verified. Please set your password.",
      ),
    );
});

const finalizeRegistration = asyncHandler(async (req, res) => {
  // Check for missing fields
  // Password Match Validation (The "Confirm Password" check)
  // Find the temporary record created in Step 1
  // Update and Activate
  // The .pre("save") hook in patient.model.js will automatically hash this
  // Response
  if (!req.body) {
    throw new ApiError(400, "Request body is missing");
  }

  const { uniqueId, password, confirmPassword } = req.body;

  if (!uniqueId || !password || !confirmPassword) {
    throw new ApiError(400, "Unique ID and both password fields are required.");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match. Please try again.");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long.");
  }

  const patient = await Patient.findOne({ upid: uniqueId });

  if (!patient) {
    throw new ApiError(
      404,
      "Registration session not found or expired. Please restart.",
    );
  }

  patient.password = password;
  patient.isActive = true;

  await patient.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { upid: patient.upid },
        "Profile created successfully! You can now login with your Unique ID.",
      ),
    );
});

//*********************login patient*****************
const loginPatient = asyncHandler(async (req, res) => {
  // Steps:
  // 1. Validation
  // 2. Find patient by unique ID
  // 3. Get data from req.body (using upid instead of username/email)
  // 4. Check if password is correct (using the method we wrote in patient.model.js)
  // 5. Generate Access and Refresh Tokens (using the methods we wrote in patient.model.js)
  // 6. Save refresh token to DB and update last login
  // 7. Remove sensitive fields before sending the response
  // 8. Setup Cookie options for Vercel -> Render communication
  // 9. Send response with cookies and JSON data
  const { upid, password } = req.body;

  if (!upid || !password) {
    throw new ApiError(400, "Unique ID and password are required");
  }

  const patient = await Patient.findOne({ upid: upid }).select("+password");

  if (!patient) {
    throw new ApiError(404, "Patient record not found");
  }

  if (!patient.isActive) {
    throw new ApiError(
      403,
      "Please finalize your registration before logging in.",
    );
  }

  const isPasswordValid = await patient.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid patient credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    patient._id,
    "patient",
  );

  const loggedInPatient = await Patient.findById(patient._id).select(
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
          patient: loggedInPatient,
          accessToken, // Sent in body so frontend can easily store it
        },
        "Login successful! Welcome to your Health Vault.",
      ),
    );
});

//*********************logout patient*****************
const logoutPatient = asyncHandler(async (req, res) => {
  // Steps:
  // 1. Verify JWT and get patient ID from token (handled by auth middleware)
  // 2. Clear refresh token from DB
  // 3. Clear cookies on client side (accessToken and refreshToken)
  // 4. Send response confirming logout
  await Patient.findByIdAndUpdate(
    req.user._id, //in verify jwt it automatically assigns role as patient
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
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

//*********************get patient profile****************
const getPatientProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Patient profile fetched successfully"),
    );
});

//DASHBOARD PROFILE EDIT PART
//*****************update patient profile*****************
const updatePatientProfile = asyncHandler(async (req, res) => {
  const { fullName, email, phone, address, emergencyContact } = req.body;

  const updateData = {};

  if (fullName) updateData.fullName = fullName;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;

  if (emergencyContact) {
    const phoneValue = typeof emergencyContact === 'object' 
        ? emergencyContact.phone 
        : emergencyContact;

    if (phoneValue) {
        updateData["emergencyContact.phone"] = phoneValue;
        updateData["emergencyContact.name"] = "Emergency Contact"; 
    }
  }

  if (req.file?.path) {
    try {
      const patient = await Patient.findById(req.user?._id);

      if (patient?.profilePhoto) {
        try {
          const publicId = patient.profilePhoto
            .split("/upload/")[1]
            .replace(/^v\d+\//, "")
            .replace(/\.[^/.]+$/, "");

          await deleteFromCloudinary(publicId);
        } catch (delErr) {
          console.error("Cloudinary Old Image Delete Error (Non-Fatal):", delErr.message);
        }
      }

      const photoUpload = await uploadOnCloudinary(req.file.path);

      if (!photoUpload?.secure_url) {
        throw new ApiError(400, "Failed to upload new profile photo to Cloudinary");
      }

      updateData.profilePhoto = photoUpload.secure_url;
    } catch (uploadErr) {
      console.error("Cloudinary Upload Process Error:", uploadErr);
      throw new ApiError(500, uploadErr.message || "Error processing image upload");
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No changes provided for update");
  }

  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.user?._id,
      { $set: updateData },
      {
        new: true, 
        runValidators: true,
      },
    ).select("-password -refreshToken");

    if (!updatedPatient) {
      throw new ApiError(404, "Patient record not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPatient, "Health Vault updated successfully"),
      );
  } catch (dbErr) {
    console.error("Database Update Error:", dbErr);
    throw new ApiError(500, "Internal Server Error during profile update");
  }
});

//*****************update patient password*****************
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // Steps:
  // 1. Get currentPassword, newPassword, confirmNewPassword from request body
  // 2. Validate that all fields are provided and new passwords match
  // 3. Find patient record by ID from req.user (set by auth middleware)
  // 4. Check if currentPassword is correct using the method in patient.model.js
  // 5. If correct, update password field with newPassword (it will be hashed by the pre-save hook)
  // 6. Save the patient record
  // 7. Return success response

  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (
    [oldPassword, newPassword, confirmPassword].some(
      (field) => field?.trim() === "",
    )
  ) {
    throw new ApiError(400, "All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      400,
      "New password and confirmation password do not match",
    );
  }

  const patient = await Patient.findById(req.user?._id).select("+password");

  const isPasswordCorrect = await patient.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  patient.password = newPassword;

  await patient.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

//*******************search doctors***************** */
const getAllDoctors = asyncHandler(async (req, res) => {
  const { specialty, name } = req.query;

  let filter = { isActive: true };

  if (specialty && specialty !== "All") {
    filter.specialization = specialty;
  }

  if (name) {
    filter.fullName = { $regex: name, $options: "i" };
  }

  const doctors = await Doctor.find(filter)
    .select("-password -refreshToken -email -phone") 
    .populate("hospital", "name address");

  const doctorsWithSchedules = await Promise.all(
    doctors.map(async (doc) => {
      const schedule = await DoctorSchedule.findOne({
        doctor: doc._id,
        isActive: true,
      }).select("consultationFee sittingTimeLabel workingDays timeSlots");

      const assistant = await DoctorAssistant.findOne(
        { doctor: doc._id }).select("phone"); 

      return {
        ...doc._doc,
        schedule: schedule || null,
        assistantPhone: assistant ? assistant.phone : "N/A", 
      };
    }),
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        doctorsWithSchedules,
        "Doctors, schedules, and assistant contacts fetched successfully",
      ),
    );
});

//*******************APPOINTMENT PART***************** */
//*******************Get Appointments************* */
const getPatientAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query; //scheduled, completed, or cancelled

  if (!status) {
    throw new ApiError(
      400,
      "Status query parameter is required (scheduled/completed/cancelled)",
    );
  }

  const appointments = await Appointment.find({
    patient: req.user._id,
    bookingStatus: status.toLowerCase(),
  })
    .populate("doctor", "fullName specialization")
    .populate("hospital", "name location")
    .sort({ appointmentDate: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointments,
        `Fetched ${status} appointments successfully`,
      ),
    );
});

//*******************Cancel Appointment************* */
const cancelAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      patient: req.user._id,
      bookingStatus: "scheduled",
    },
    {
      $set: {
        bookingStatus: "cancelled",
        queueStatus: "cancelled",
        cancellationReason: "Cancelled by Patient via Portal",
      },
    },
    { new: true },
  );

  if (!appointment) {
    throw new ApiError(
      404,
      "Appointment not found or is already completed/cancelled.",
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment cancelled successfully."),
    );
});

// **********Get Assistant Contact for Rescheduling *************
const getAssistantContactForReschedule = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(appointmentId).populate("doctor", "fullName");

  if (!appointment) {
    throw new ApiError(404, "Appointment record not found.");
  }

  const assistant = await DoctorAssistant.findOne({ 
    doctor: appointment.doctor._id 
  }).select("fullName phone email"); 

  if (!assistant) {
    throw new ApiError(404, `No designated assistant found for ${appointment.doctor.fullName}.`);
  }

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        doctorName: appointment.doctor.fullName,
        assistantName: assistant.fullName,
        contactNumber: assistant.phone || "N/A", 
        email: assistant.email
      }, 
      "Assistant contact details retrieved successfully."
    )
  );
});

//*********************Delete Appointments************* */
const bulkDeleteAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  if (!status) {
    throw new ApiError(400, "Please specify which status history to clear.");
  }

  const result = await Appointment.deleteMany({
    patient: req.user._id,
    bookingStatus: status.toLowerCase(),
  });

  if (result.deletedCount === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { deletedCount: 0 },
          `No ${status} records found to clear.`,
        ),
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        `Successfully cleared ${result.deletedCount} records from your ${status} history.`,
      ),
    );
});

export {
  initializeRegistration,
  finalizeRegistration,
  loginPatient,
  logoutPatient,
  getPatientProfile,
  updatePatientProfile,
  changeCurrentPassword,
  getAllDoctors,
  getPatientAppointments,
  cancelAppointment,
  getAssistantContactForReschedule,
  bulkDeleteAppointments,
};
