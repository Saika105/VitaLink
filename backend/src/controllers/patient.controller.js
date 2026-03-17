import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Patient } from "../models/patient.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (patientId) => {
  try {
    const patient = await Patient.findById(patientId);
    const accessToken = patient.generateAccessToken();
    const refreshToken = patient.generateRefreshToken();

    patient.refreshToken = refreshToken;
    await patient.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating security tokens");
  }
};

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

  if (!upid || !password) {
    throw new ApiError(400, "Unique ID and password are required");
  }

  const patient = await Patient.findOne({ upid }).select("+password");

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
  );

  const loggedInPatient = await Patient.findById(patient._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true, // Must be true for HTTPS/Production
    sameSite: "none", // Required for cross-site (Vercel to Render)
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const patient = await Patient.findById(decodedToken?._id);

    if (!patient || incomingRefreshToken !== patient?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(patient._id);

    const options = { httpOnly: true, secure: true, sameSite: "none" };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
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
  // 1. Get text fields from request body
  // 2. Prepare an empty update object
  // 3. Handle Profile Photo Update
  //    a. If new photo is uploaded, find the patient record to get existing photo URL
  //    b. Delete existing photo from Cloudinary (if exists)
  //    c. Upload new photo to Cloudinary and get the URL
  //    d. Add new photo URL to update object
  // 4. If no fields are provided for update, return an error
  // 5. Update patient record in DB with the update object
  // 6. Return updated patient profile in response

  const { fullName, email, phone, address, emergencyContact } = req.body;

  const updateData = {};

  if (fullName) updateData.fullName = fullName;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;
  if (emergencyContact) updateData.emergencyContact = emergencyContact;

  if (req.file?.path) {
    const patient = await Patient.findById(req.user?._id);

    if (patient?.profilePhoto) {
      await deleteFromCloudinary(patient.profilePhoto);
    }

    const photoUpload = await uploadOnCloudinary(req.file.path);

    if (!photoUpload?.secure_url) {
      throw new ApiError(400, "Failed to upload new profile photo");
    }

    updateData.profilePhoto = photoUpload.secure_url;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No changes provided for update");
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    req.user?._id,
    { $set: updateData },
    {
      returnDocument: "after",
      runValidators: true,
      //   new: true,
      //   runValidators: true, // Ensures email/phone formats are still valid
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

export {
  initializeRegistration,
  finalizeRegistration,
  loginPatient,
  logoutPatient,
  refreshAccessToken,
  getPatientProfile,
  updatePatientProfile,
  changeCurrentPassword,
};
