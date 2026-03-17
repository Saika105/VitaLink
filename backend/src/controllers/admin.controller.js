import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { Doctor } from "../models/doctor.model.js";
import { DoctorAssistant } from "../models/doctorAssistant.model.js";
import { LabAssistant } from "../models/labAssistant.model.js";
import { Receptionist } from "../models/receptionist.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

