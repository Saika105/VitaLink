import mongoose from "mongoose"; 
import { baseSchemaOptions, externalIdField } from "./_shared.js";
const labRoomSchema = new mongoose.Schema(
  {
    roomId: externalIdField("ROOM"),
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    roomName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    floor: {
      type: String,
      trim: true,
      maxlength: 30,
    },
  },
  baseSchemaOptions
);
labRoomSchema.index({ hospital: 1, roomNumber: 1 }, { unique: true });
export const LabRoom = mongoose.model("LabRoom", labRoomSchema);
