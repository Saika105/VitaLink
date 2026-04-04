import mongoose from "mongoose";
import {
  APPOINTMENT_BOOKING_STATUS,
  APPOINTMENT_QUEUE_STATUS,
  APPOINTMENT_TYPES,
} from "./enums.js";
import { TIME_REGEX } from "./regex.js";
import {
  baseSchemaOptions,
  externalIdField,
  timeSlotSchema,
  validateTimeSlotOrder,
} from "./_shared.js";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: externalIdField("APPT"),

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

    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },

    timeSlot: {
      type: timeSlotSchema,
      required: true,
    },

    serialNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    appointmentType: {
      type: String,
      required: true,
      enum: APPOINTMENT_TYPES,
      default: "consultation",
    },

    bookingStatus: {
      type: String,
      required: true,
      enum: APPOINTMENT_BOOKING_STATUS,
      default: "scheduled",
    },

    queueStatus: {
      type: String,
      required: true,
      enum: APPOINTMENT_QUEUE_STATUS,
      default: "not_added",
    },

    reasonForVisit: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    symptoms: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    arrivalTime: {
      type: String,
      trim: true,
      match: TIME_REGEX,
      default: null,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    addedToQueueByAssistant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorAssistant",
      default: null,
    },

    queueAddedAt: {
      type: Date,
      default: null,
    },

    rescheduleDate: {
      type: Date,
      default: null,
    },

    rescheduleTimeSlot: {
      type: timeSlotSchema,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  baseSchemaOptions
);

appointmentSchema.index(
  { doctor: 1, hospital: 1, appointmentDate: 1, serialNumber: 1 },
  { unique: true }
);
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1, queueStatus: 1 });

appointmentSchema.pre("validate", function (next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (this.isNew && this.appointmentDate < today) {
    return next(new Error("appointmentDate cannot be in the past"));
  }
  if (!validateTimeSlotOrder(this.timeSlot)) {
    return next(new Error("timeSlot start must be before end"));
  }
  if (
    this.bookingStatus === "cancelled" &&
    (!this.cancellationReason || !this.cancellationReason.trim())
  ) {
    return next(new Error("cancellationReason is required when appointment is cancelled"));
  }
  if (
    this.bookingStatus === "rescheduled" &&
    (!this.rescheduleDate ||
      !this.rescheduleTimeSlot ||
      !validateTimeSlotOrder(this.rescheduleTimeSlot))
  ) {
    return next(
      new Error("rescheduleDate and valid rescheduleTimeSlot are required when rescheduled")
    );
  }
  if (this.queueStatus !== "not_added" && !this.queueAddedAt) {
    this.queueAddedAt = new Date();
  }
  if (this.followUpDate && this.followUpDate < this.appointmentDate) {
    return next(new Error("followUpDate must be on or after appointmentDate"));
  }

  next();
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);

