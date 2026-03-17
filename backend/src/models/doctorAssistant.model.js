import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  baseSchemaOptions,
  createStaffBaseFields,
  externalIdField,
} from "./_shared.js";

const doctorAssistantSchema = new mongoose.Schema(
  {
    assistantId: externalIdField("DR-ASST"),

    ...createStaffBaseFields(),

    // The doctor this assistant is assigned to
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    // Admin who created this assistant account
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
  },
  baseSchemaOptions
);

doctorAssistantSchema.index({ doctor: 1, hospital: 1 });

doctorAssistantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

doctorAssistantSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

doctorAssistantSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "doctor_assistant",
      loginId: this.assistantId,
      fullName: this.fullName,
      hospital: this.hospital,
      doctor: this.doctor,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

doctorAssistantSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "doctor_assistant",
      loginId: this.assistantId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const DoctorAssistant = mongoose.model("DoctorAssistant", doctorAssistantSchema);
export default DoctorAssistant;
