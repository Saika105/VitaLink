import mongoose from "mongoose";

const diagnosticTestSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "LabRoom",
    required: true 
  },
  category: String, 
});

export const DiagnosticTest = mongoose.model("DiagnosticTest", diagnosticTestSchema);