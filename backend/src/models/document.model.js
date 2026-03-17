import mongoose from "mongoose";
import { DOCUMENT_TYPES } from "./enums.js";
import { baseSchemaOptions, externalIdField, fileSchema } from "./_shared.js";

const documentSchema = new mongoose.Schema(
  {
    documentId: externalIdField("DOCS"),

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

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
      index: true,
    },

    // Which model uploaded this document
    uploadedByModel: {
      type: String,
      required: true,
      enum: ["Doctor", "DoctorAssistant", "LabAssistant", "Patient"],
    },

    // The actual uploader's ObjectId — resolves using uploadedByModel
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "uploadedByModel",
    },

    documentType: {
      type: String,
      required: true,
      enum: DOCUMENT_TYPES,
      default: "other",
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    file: {
      type: fileSchema,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  baseSchemaOptions
);

documentSchema.index({ patient: 1, createdAt: -1 });
documentSchema.index({ appointment: 1, createdAt: -1 });

// ✅ Bug fix: original had `const document` (lowercase) but exported `Document` (capital)
// which would throw a ReferenceError at runtime
const Document = mongoose.model("Document", documentSchema);
export default Document;
