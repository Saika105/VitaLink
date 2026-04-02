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
      required: false,
      index: true,
    },

    manualDoctorName: {
      type: String,
      trim: true,
      default: null,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: false,
      index: true,
    },

    manualHospitalName: {
      type: String,
      trim: true,
      default: null,
    },

    uploadedByAssistant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorAssistant",
      default: null,
      index: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: false,
      index: true,
    },

    diagnosis: {
      type: String,
      required: false,
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
      required: false,
      validate: {
        validator: function (value) {
          if (this.source === "doctor") {
            return Array.isArray(value) && value.length > 0;
          }
          return true; 
        },
        message:
          "At least one medication is required for doctor-issued prescriptions",
      },
    },

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
  baseSchemaOptions,
);

prescriptionSchema.index({ patient: 1, prescribedDate: -1 });

prescriptionSchema.pre("validate", async function () {
  if (this.source === "doctor_assistant" && !this.uploadedByAssistant) {
    throw new Error("uploadedByAssistant is required when source is doctor_assistant");
  }

  if (this.followUpDate && this.followUpDate <= this.prescribedDate) {
    throw new Error("followUpDate must be after prescribedDate");
  }
});

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
