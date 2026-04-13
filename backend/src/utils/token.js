import { Admin } from "../models/admin.model.js";
import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { LabAssistant } from "../models/labAssistant.model.js";
import { Receptionist } from "../models/receptionist.model.js";
import { ApiError } from "./ApiError.js";

export const generateAccessAndRefreshToken = async (userId, role) => {
  try {
    let Model;

    if (role === "admin") {
      Model = Admin;
    } else if (role === "patient") {
      Model = Patient;
    } else if (role === "doctor") {
      Model = Doctor;
    } else if (role === "doctor_assistant") {
      Model = DoctorAssistant;
    } else if (role === "lab_assistant") {
      Model = LabAssistant;
    } else if (role === "receptionist") {
      Model = Receptionist;
    }

    if (!Model) {
      throw new ApiError(400, `Invalid role provided: ${role}`);
    }

    const user = await Model.findById(userId);
    
    if (!user) {
      throw new ApiError(404, "User record not found in the database");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    
    user.lastLoginAt = new Date();

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(
      500, 
      error?.message || "Internal Server Error while generating security tokens"
    );
  }
};