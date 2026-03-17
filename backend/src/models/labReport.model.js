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

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    // Only set when source is "lab_assistant"
    labAssistant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabAssistant",
      default: null,
      index: true,
    },

    // The prescription that ordered this test (if any)
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
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
      required: true,
    },

    reportDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    // Report can only be uploaded after payment is confirmed
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

labReportSchema.pre("validate", function (next) {
  if (this.source === "lab_assistant" && !this.labAssistant) {
    return next(new Error("labAssistant is required when source is lab_assistant"));
  }
  next();
});

const LabReport = mongoose.model("LabReport", labReportSchema);
export default LabReport;
