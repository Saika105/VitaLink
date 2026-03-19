import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//*************Doctor Assistant login ********** */
const loginAssistant = asyncHandler(async (req, res) => {
  const { assistantId, password } = req.body;

  if (!assistantId || !password) {
    throw new ApiError(400, "Assistant ID and password are required");
  }

  const assistant = await DoctorAssistant.findOne({ assistantId }).select("+password");

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

export { loginAssistant, logoutAssistant };
