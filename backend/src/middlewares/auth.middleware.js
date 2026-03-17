// src/middlewares/auth.middleware.js
// Verifies JWT, finds the correct user based on role, attaches to req.user

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Admin from "../models/admin.model.js";
import DoctorAssistant from "../models/doctorAssistant.model.js";
import LabAssistant from "../models/labAssistant.model.js";
import Receptionist from "../models/receptionist.model.js";

// Map role string from JWT to correct Mongoose model
const roleModelMap = {
  patient: Patient,
  doctor: Doctor,
  admin: Admin,
  doctor_assistant: DoctorAssistant,
  lab_assistant: LabAssistant,
  receptionist: Receptionist,
};

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const Model = roleModelMap[decodedToken?.role];
    if (!Model) {
      throw new ApiError(401, "Invalid token role");
    }

    const user = await Model.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    req.role = decodedToken.role;

    next();

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});