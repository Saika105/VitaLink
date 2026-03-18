import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { Hospital } from "../models/hospital.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
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
    admin._id, "admin"
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





export { loginAdmin, logoutAdmin};
