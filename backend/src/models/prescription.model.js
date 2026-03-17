import mongoose from "mongoose";
import { PRESCRIPTION_SOURCES } from "./enums.js";
import {
  baseSchemaOptions,
  externalIdField,
  fileSchema,
  medicationSchema,
} from "./_shared.js";

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: externalIdField("PR"),

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

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

    // Only set when source is "doctor_assistant"
    uploadedByAssistant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorAssistant",
      default: null,
      index: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    advice: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    medications: {
      type: [medicationSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one medication is required",
      },
    },

    // For scanned/uploaded handwritten prescriptions
    prescriptionFile: {
      type: fileSchema,
      default: null,
    },

    prescribedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    source: {
      type: String,
      required: true,
      enum: PRESCRIPTION_SOURCES,
      default: "doctor",
    },
  },
  baseSchemaOptions
);

prescriptionSchema.index({ patient: 1, prescribedDate: -1 });

prescriptionSchema.pre("validate", function (next) {
  if (this.source === "doctor_assistant" && !this.uploadedByAssistant) {
    return next(new Error("uploadedByAssistant is required when source is doctor_assistant"));
  }
  if (this.followUpDate && this.followUpDate <= this.prescribedDate) {
    return next(new Error("followUpDate must be after prescribedDate"));
  }
  next();
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
