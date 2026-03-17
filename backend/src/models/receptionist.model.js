import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  baseSchemaOptions,
  createStaffBaseFields,
  externalIdField,
} from "./_shared.js";

const receptionistSchema = new mongoose.Schema(
  {
    receptionistId: externalIdField("REC"),

    ...createStaffBaseFields(),

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    // Admin who created this receptionist account
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
  },
  baseSchemaOptions
);

receptionistSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

receptionistSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

receptionistSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "receptionist",
      loginId: this.receptionistId,
      fullName: this.fullName,
      hospital: this.hospital,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

receptionistSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: "receptionist",
      loginId: this.receptionistId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// ✅ Bug fix: original file was missing this line entirely
const Receptionist = mongoose.model("Receptionist", receptionistSchema);
export default Receptionist;
