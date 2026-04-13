import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Receptionist } from "../models/receptionist.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//*************Receptionist login ********** */
const loginReceptionist = asyncHandler(async (req, res) => {
  const { receptionistId, password } = req.body;

  if (!receptionistId || !password) {
    throw new ApiError(400, "Receptionist ID and password are required");
  }

  const receptionist = await Receptionist.findOne({ receptionistId }).select(
    "+password",
  );

  if (!receptionist) {
    throw new ApiError(401, "Invalid Receptionist ID or password");
  }

  const isPasswordValid = await receptionist.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Receptionist ID or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    receptionist._id,
    "receptionist",
  );

  const loggedInReceptionist = await Receptionist.findById(
    receptionist._id,
  ).select("-password -refreshToken");

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
          user: loggedInReceptionist,
          token: accessToken,
        },
        "Receptionist logged in successfully",
      ),
    );
});

//*************Receptionist logout ********** */
const logoutReceptionist = asyncHandler(async (req, res) => {
  console.log(
    `Receptionist Logging Out: ${req.user?.fullName} (ID: ${req.user?._id})`,
  );

  await Receptionist.findByIdAndUpdate(
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
    .json(new ApiResponse(200, {}, "Receptionist logged out successfully"));
});

export { loginReceptionist, logoutReceptionist };
