import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { EMAIL_REGEX } from "./regex.js";
import { baseSchemaOptions, externalIdField } from "./_shared.js";

// One Admin per hospital. Admins are seeded directly into the DB — no register route.
// Admin can: login, and create Doctor / DoctorAssistant / LabAssistant / Receptionist
// for their own hospital only.

const adminSchema = new mongoose.Schema(
  {
    adminId: externalIdField("ADMIN"),

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
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

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      unique: true, // one admin per hospital
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  baseSchemaOptions
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "admin",
      loginId: this.adminId,
      fullName: this.fullName,
      hospital: this.hospital,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "admin",
      loginId: this.adminId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
