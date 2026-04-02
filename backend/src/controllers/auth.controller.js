import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.model.js";
import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { LabAssistant } from "../models/labAssistant.model.js";
import { Receptionist } from "../models/receptionist.model.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";

const roleModelMap = {
  admin: Admin,
  patient: Patient,
  doctor: Doctor,
  doctor_assistant: DoctorAssistant,
  lab_assistant: LabAssistant,
  receptionist: Receptionist,
};

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const Model = roleModelMap[decodedToken?.role];

    if (!Model) {
      throw new ApiError(401, "Invalid token role");
    }

    const user = await Model.findById(decodedToken?._id).select(
      "+refreshToken",
    );

    if (!user || !user.refreshToken) {
      throw new ApiError(401, "User session has expired. Please login again.");
    }

    if (incomingRefreshToken.trim() !== user.refreshToken.trim()) {
      throw new ApiError(401, "Token is invalid or has already been used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id, decodedToken.role);

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken, // frontend update 
            role: decodedToken.role,
          },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token session");
  }
});

