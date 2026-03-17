import mongoose from "mongoose";
import { PAYMENT_METHODS, PAYMENT_STATUS } from "./enums.js";
import {
  baseSchemaOptions,
  billItemSchema,
  externalIdField,
  paymentEntrySchema,
} from "./_shared.js";

const billSchema = new mongoose.Schema(
  {
    invoiceNumber: externalIdField("INV"),

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

    // Receptionist who created this bill
    receptionist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receptionist",
      required: true,
      index: true,
    },

    // Bill must be linked to an appointment, a lab report, or both
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
      index: true,
    },

    labReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabReport",
      default: null,
      index: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    billSummary: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },

    items: {
      type: [billItemSchema],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Bill must contain at least one item",
      },
    },

    subtotal: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },

    // Array of payments (supports partial payments)
    payments: { type: [paymentEntrySchema], default: [] },

    amountPaid: { type: Number, required: true, min: 0, default: 0 },
    balanceDue: { type: Number, required: true, min: 0, default: 0 },

    // Last payment method used
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: null,
    },

    paymentStatus: {
      type: String,
      required: true,
      enum: PAYMENT_STATUS,
      default: "due",
    },

    paidAt: { type: Date, default: null },
  },
  baseSchemaOptions
);

billSchema.index({ patient: 1, invoiceDate: -1 });
billSchema.index({ hospital: 1, paymentStatus: 1 });

billSchema.pre("validate", function (next) {
  if (!this.appointment && !this.labReport) {
    return next(new Error("Bill must be linked to an appointment, a lab report, or both"));
  }

  // Auto-calculate item amounts
  for (let i = 0; i < this.items.length; i++) {
    this.items[i].amount = Number(this.items[i].quantity) * Number(this.items[i].unitPrice);
  }

  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);

  if (this.discount > this.subtotal) {
    return next(new Error("discount cannot be greater than subtotal"));
  }

  this.totalAmount = Math.max(0, this.subtotal - this.discount);
  this.amountPaid = this.payments.reduce((sum, p) => sum + p.amount, 0);

  if (this.amountPaid > this.totalAmount) {
    return next(new Error("amountPaid cannot be greater than totalAmount"));
  }

  this.balanceDue = Math.max(0, this.totalAmount - this.amountPaid);

  if (this.payments.length > 0) {
    this.paymentMethod = this.payments[this.payments.length - 1].method;
  }

  // Auto-set payment status
  if (this.paymentStatus === "cancelled" || this.paymentStatus === "refunded") {
    return next();
  }
  if (this.totalAmount === 0 || this.balanceDue === 0) {
    this.paymentStatus = "paid";
    this.paidAt = this.payments.length
      ? this.payments[this.payments.length - 1].paidAt
      : new Date();
  } else if (this.amountPaid > 0) {
    this.paymentStatus = "partially_paid";
    this.paidAt = null;
  } else {
    this.paymentStatus = "due";
    this.paidAt = null;
  }

  next();
});

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
