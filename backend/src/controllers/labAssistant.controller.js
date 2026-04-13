import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { LabAssistant } from "../models/labAssistant.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//*************Lab Assistant login ********** */
const loginLabAssistant = asyncHandler(async (req, res) => {
  const { labAssistantId, password } = req.body;

  if (!labAssistantId || !password) {
    throw new ApiError(400, "Lab Assistant ID and password are required");
  }

  const labAssistant = await LabAssistant.findOne({ labAssistantId }).select(
    "+password",
  );

  if (!labAssistant) {
    throw new ApiError(401, "Invalid Lab Assistant ID or password");
  }
  const isPasswordValid = await labAssistant.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Lab Assistant ID or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    labAssistant._id,
    "lab_assistant",
  );

  const loggedInLabStaff = await LabAssistant.findById(labAssistant._id).select(
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
          user: loggedInLabStaff,
          token: accessToken,
        },
        "Lab Assistant logged in successfully",
      ),
    );
});

//*************Lab Assistant logout ********** */
const logoutLabAssistant = asyncHandler(async (req, res) => {
  console.log(
    `Lab Assistant Logging Out: ${req.user?.fullName} (ID: ${req.user?._id})`,
  );

  await LabAssistant.findByIdAndUpdate(
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
    .json(new ApiResponse(200, {}, "Lab Assistant logged out successfully"));
});

export { loginLabAssistant, logoutLabAssistant };
