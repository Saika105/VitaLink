import mongoose from "mongoose";
import { REPORT_SOURCES } from "./enums.js";
import { baseSchemaOptions, externalIdField, fileSchema } from "./_shared.js";

const labReportSchema = new mongoose.Schema(
  {
    reportId: externalIdField("REP"),

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    manualHospitalName: {
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

    labAssistant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabAssistant",
      default: null,
      index: true,
    },

    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      index: true,
    },

    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
      index: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabRoom",
      default: null,
      index: true,
    },

    testName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    testType: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    reportFile: {
      type: fileSchema,
      required: false, 
    },

    reportDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    source: {
      type: String,
      required: true,
      enum: REPORT_SOURCES,
      default: "lab_assistant",
    },
  },
  baseSchemaOptions
);

labReportSchema.index({ patient: 1, reportDate: -1 });

labReportSchema.pre("validate", async function () {
  if (this.source === "imported") {
    this.status = "completed";
    this.isPaid = true;
    if (!this.reportFile) {
      throw new Error("File is required for imported reports");
    }
  }

  if (
    this.source === "lab_assistant" && 
    this.status === "completed" && 
    !this.labAssistant
  ) {
    throw new Error("labAssistant is required to finalize hospital reports");
  }
});

export const LabReport = mongoose.model("LabReport", labReportSchema);