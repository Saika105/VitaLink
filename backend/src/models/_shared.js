import mongoose from "mongoose";
import { EMAIL_REGEX, PHONE_REGEX, TIME_REGEX } from "./regex.js";
import { GENDERS, PAYMENT_METHODS } from "./enums.js";

const Schema = mongoose.Schema;

export const baseSchemaOptions = {
  timestamps: true,
  strict: "throw",
  minimize: false,
};

export function externalIdField(prefix) {
  return {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    uppercase: true,
    trim: true,
    match: new RegExp("^" + prefix + "-[A-Z0-9]{4,20}$"),
  };
}

// Sub-schema for file uploads (Cloudinary)
export const fileSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, required: true, trim: true },
    originalName: { type: String, trim: true, maxlength: 255 },
    mimeType: { type: String, trim: true, maxlength: 100 },
    size: { type: Number, min: 0 },
  },
  { _id: false },
);

// Sub-schema for emergency contact
export const emergencyContactSchema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 100, default: "" },
    phone: { type: String, required: true, trim: true, match: PHONE_REGEX },
    relation: { type: String, trim: true, maxlength: 50, default: "" },
  },
  { _id: false },
);

// Sub-schema for time slots (e.g. "09:00" - "12:00")
export const timeSlotSchema = new Schema(
  {
    start: { type: String, required: true, match: TIME_REGEX },
    end: { type: String, required: true, match: TIME_REGEX },
  },
  { _id: false },
);

// Sub-schema for a single medication entry in a prescription
export const medicationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    dosage: { type: String, trim: true, maxlength: 120 },
    frequency: { type: String, trim: true, maxlength: 120 },
    duration: { type: String, trim: true, maxlength: 120 },
    instructions: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

// Sub-schema for a single line item in a bill
export const billItemSchema = new Schema(
  {
    itemType: {
      type: String,
      required: true,
      enum: ["consultation", "labtest", "medicine", "other"],
    },
    description: { type: String, required: true, trim: true, maxlength: 200 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0, default: 0 },
    linkedAppointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    linkedLabReport: {
      type: Schema.Types.ObjectId,
      ref: "LabReport",
      default: null,
    },
  },
  { _id: false },
);

// Sub-schema for a single payment entry (bills can have multiple partial payments)
export const paymentEntrySchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, required: true, enum: PAYMENT_METHODS },
    paidAt: { type: Date, default: Date.now },
    reference: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false },
);

// Reusable base fields shared across all staff roles
// (Doctor, DoctorAssistant, LabAssistant, Receptionist)
export function createStaffBaseFields() {
  return {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    nidNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: 20,
    },

    dateOfBirth: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value < new Date();
        },
        message: "DOB must be in the past",
      },
    },

    gender: {
      type: String,
      required: true,
      enum: GENDERS,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: PHONE_REGEX,
      unique: true,
    },

    emergencyContact: {
      type: emergencyContactSchema,
      required: true,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
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

    isActive: {
      type: Boolean,
      default: true,
    },
  };
}

// Validates that a time slot's start is before its end
export function validateTimeSlotOrder(slot) {
  if (!slot || !slot.start || !slot.end) return false;
  return slot.start < slot.end;
}
