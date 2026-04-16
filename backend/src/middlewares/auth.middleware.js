// src/middlewares/auth.middleware.js
// Verifies JWT, finds the correct user based on role, attaches to req.user

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Admin } from "../models/admin.model.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { LabAssistant } from "../models/labAssistant.model.js";
import { Receptionist } from "../models/receptionist.model.js";

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
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    //new field to store role along with user details, so we don't have to decode the token again in controllers to check the role
    const userWithRole = user.toObject();
    userWithRole.role = decodedToken.role;

    req.user = userWithRole;
    req.role = decodedToken.role;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const isAdmin = (req, res, next) => {
  if (req.user && req.role === "admin") {
    next();
  } else {
    throw new ApiError(401, "Access denied. Admin rights required.");
  }
};

export const isDoctorAssistant = (req, res, next) => {
  if (req.user && req.role === "doctor_assistant") {
    if (!req.user.doctor || !req.user.hospital) {
      throw new ApiError(
        401,
        "Assistant is not assigned to a doctor or hospital session.",
      );
    }
    next();
  } else {
    throw new ApiError(401, "Access denied. Doctor Assistant rights required.");
  }
};

export const isPatient = (req, res, next) => {
    if (req.user && req.role === "patient") {
        next();
    } else {
        throw new ApiError(401, "Access denied. Patient account required.");
    }
};

export const isDoctor = (req, res, next) => {
    if (req.user && req.role === "doctor") {
        next();
    } else {
        throw new ApiError(401, "Access denied. Doctor credentials required.");
    }
};

export const isLabAssistant = (req, res, next) => {
    if (req.user && req.role === "lab_assistant") {
        next();
    } else {
        throw new ApiError(401, "Access denied. Lab Assistant rights required.");
    }
};

export const isReceptionist = (req, res, next) => {
    if (req.user && req.role === "receptionist") {
        next();
    } else {
        throw new ApiError(403, "Access denied. Receptionist credentials required.");
    }
};
