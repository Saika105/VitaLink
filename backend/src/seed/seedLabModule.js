import mongoose from "mongoose";
import { Hospital } from "../models/hospital.model.js";
import { LabRoom } from "../models/labRoom.model.js";
import { DiagnosticTest } from "../models/diagnosticTest.model.js";
import dotenv from "dotenv";

dotenv.config();

const diagnosticTests = [
  { name: "Complete Blood Count (CBC)", price: 450, category: "Pathology" },
  { name: "Lipid Profile", price: 1200, category: "Pathology" },
  { name: "Liver Function Test (LFT)", price: 1500, category: "Pathology" },
  { name: "Kidney Function Test (KFT)", price: 1400, category: "Pathology" },
  { name: "Blood Sugar (Fasting/Random)", price: 150, category: "Pathology" },
  { name: "Thyroid Profile (TSH)", price: 1100, category: "Pathology" },
  { name: "Urine Routine Examination", price: 250, category: "Pathology" },
  { name: "X-Ray Chest PA View", price: 600, category: "Radiology" },
  { name: "USG Whole Abdomen", price: 2200, category: "Radiology" },
  { name: "ECG (12 Lead)", price: 400, category: "Radiology" },
  { name: "CT Scan Brain", price: 4500, category: "Radiology" },
  { name: "MRI Lumbar Spine", price: 8500, category: "Radiology" }
];

const seedLabData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    const square = await Hospital.findOne({ email: "info@squarehospital.com" });
    const popular = await Hospital.findOne({ email: "info@popular-phc.com" });

    if (!square || !popular) {
      throw new Error("Hospitals not found! Run your admin seed script first.");
    }

    const hospitalList = [square, popular];

    for (const hospital of hospitalList) {
      console.log(`Seeding Labs for ${hospital.name}`);

      const pathologyRoom = await LabRoom.findOneAndUpdate(
        { hospital: hospital._id, roomNumber: "101" },
        { roomName: "Pathology Lab", floor: "2nd Floor" },
        { upsert: true, new: true }
      );

      const radiologyRoom = await LabRoom.findOneAndUpdate(
        { hospital: hospital._id, roomNumber: "201" },
        { roomName: "Radiology & Imaging", floor: "Ground Floor" },
        { upsert: true, new: true }
      );

      for (const test of diagnosticTests) {
        const roomId = test.category === "Radiology" ? radiologyRoom._id : pathologyRoom._id;

        await DiagnosticTest.findOneAndUpdate(
          { name: test.name },
          { 
            ...test, 
            room: roomId 
          },
          { upsert: true, new: true }
        );
      }
      console.log(`Seeded ${diagnosticTests.length} tests for ${hospital.name}`);
    }

    console.log("Lab Seeding Finished Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding Lab Module:", error);
    process.exit(1);
  }
};

seedLabData();