import mongoose from "mongoose";
import { WEEK_DAYS } from "./enums.js";
import {
  baseSchemaOptions,
  externalIdField,
  timeSlotSchema,
  validateTimeSlotOrder,
} from "./_shared.js";

// Stores a doctor's schedule at a specific hospital:
// working days, time slots, and consultation fee.
// Used by the appointment booking flow.

const doctorScheduleSchema = new mongoose.Schema(
  {
    scheduleId: externalIdField("SCHED"),

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

    specializationLabel: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },

    // Human-readable sitting time e.g. "Morning: 9AM - 12PM"
    sittingTimeLabel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    workingDays: {
      type: [String],
      required: true,
      enum: WEEK_DAYS,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "workingDays must contain at least one day",
      },
    },

    timeSlots: {
      type: [timeSlotSchema],
      required: true,
      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every(function (slot) {
              return validateTimeSlotOrder(slot);
            })
          );
        },
        message: "timeSlots must contain valid start/end values",
      },
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  baseSchemaOptions
);

// A doctor can only have one schedule per hospital
doctorScheduleSchema.index({ doctor: 1, hospital: 1 }, { unique: true });

const DoctorSchedule = mongoose.model("DoctorSchedule", doctorScheduleSchema);
export default DoctorSchedule;
