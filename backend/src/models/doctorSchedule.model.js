import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false },
);

const doctorScheduleSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: String,
      required: true,
      unique: true,
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

    sittingTimeLabel: {
      type: String,
      required: true,
      trim: true,
    },

    workingDays: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one working day is required",
      },
    },

    timeSlots: {
      type: [timeSlotSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one time slot is required",
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
  { timestamps: true },
);

doctorScheduleSchema.index({ doctor: 1, hospital: 1 }, { unique: true });

export const DoctorSchedule = mongoose.model(
  "DoctorSchedule",
  doctorScheduleSchema,
);
