import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  baseSchemaOptions,
  createStaffBaseFields,
  externalIdField,
  fileSchema,
} from "./_shared.js";

const doctorSchema = new mongoose.Schema(
  {
    doctorId: externalIdField("DOC"),

    ...createStaffBaseFields(),

    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    degree: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    yearsExperience: {
      type: Number,
      min: 0,
      max: 50,
      default: 0,
    },

    profilePhoto: {
      type: fileSchema,
      default: null,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    // Admin who created this doctor account
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
  },
  baseSchemaOptions
);

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

doctorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

doctorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "doctor",
      loginId: this.doctorId,
      fullName: this.fullName,
      hospital: this.hospital,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

doctorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "doctor",
      loginId: this.doctorId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
