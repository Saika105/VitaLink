import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { EMAIL_REGEX, PHONE_REGEX } from "./regex.js";
import { BLOOD_GROUPS, GENDERS } from "./enums.js";
import {
  baseSchemaOptions,
  emergencyContactSchema,
  externalIdField,
  fileSchema,
} from "./_shared.js";

const patientSchema = new mongoose.Schema(
  {
    upid: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: PHONE_REGEX,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: EMAIL_REGEX,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    refreshToken: {
      type: String,
      select: false,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value < new Date();
        },
        message: "DOB must be in the past",
      },
    },

    gender: {
      type: String,
      required: true,
      enum: GENDERS,
    },

    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    emergencyContact: {
      type: emergencyContactSchema,
      required: true,
    },

    profilePhoto: {
      type: String,
      default: null,
    },

    nidNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: 50,
    },

    birthCertificate: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: 50,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  baseSchemaOptions,
);

patientSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

patientSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

patientSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "patient",
      loginId: this.upid,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

patientSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "patient",
      loginId: this.upid,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

export const Patient = mongoose.model("Patient", patientSchema);
