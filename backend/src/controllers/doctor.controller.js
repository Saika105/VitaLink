import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.model.js";
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

export { loginDoctor, logoutDoctor };
