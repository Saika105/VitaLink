import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  baseSchemaOptions,
  createStaffBaseFields,
  externalIdField,
} from "./_shared.js";

const labAssistantSchema = new mongoose.Schema(
  {
    labAssistantId: externalIdField("LAB-ASST"),

    ...createStaffBaseFields(),

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    // Admin who created this lab assistant account
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
  },
  baseSchemaOptions
);

labAssistantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

labAssistantSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

labAssistantSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "lab_assistant",
      loginId: this.labAssistantId,
      fullName: this.fullName,
      hospital: this.hospital,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

labAssistantSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "lab_assistant",
      loginId: this.labAssistantId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const LabAssistant = mongoose.model("LabAssistant", labAssistantSchema);

