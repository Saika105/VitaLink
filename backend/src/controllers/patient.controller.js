import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Patient } from "../models/patient.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Utility function to generate a unique patient ID
const generateUniquePatientId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PT-${result}`;
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
  // Use explicitly scoped variables to avoid ReferenceError in strict mode.
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
      name: "Emergency Contact", // Placeholder as per schema requirement
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

  if (!upid) {
    throw new ApiError(400, "Patient Unique ID is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const patient = await Patient.findOne({ upid }).select("+password");

  if (!patient) {
    throw new ApiError(404, "Patient does not exist");
  }

  const isPasswordValid = await patient.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = patient.generateAccessToken();
  const refreshToken = patient.generateRefreshToken();

  patient.refreshToken = refreshToken;
  patient.lastLoginAt = new Date();
  await patient.save({ validateBeforeSave: false });

  const loggedInPatient = await Patient.findById(patient._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true, // Must be true for Render/Vercel
    sameSite: "none", // Must be "none" for cross-domain cookies
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
          accessToken, // Sending this so frontend can also store it in state/localStorage if needed
        },
        "Patient logged in successfully",
      ),
    );
});



export { 
    initializeRegistration, 
    finalizeRegistration, 
    loginPatient 
};
