import mongoose from "mongoose";
import { EMAIL_REGEX, PHONE_REGEX } from "./regex.js";
import { baseSchemaOptions, externalIdField } from "./_shared.js";

const hospitalSchema = new mongoose.Schema(
  {
    hospitalId: externalIdField("HOS"),

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
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

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },
  },
  baseSchemaOptions
);

export const Hospital = mongoose.model("Hospital", hospitalSchema);

