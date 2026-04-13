import mongoose from "mongoose";
import { Admin } from "../models/admin.model.js";
import { Hospital } from "../models/hospital.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedHospitalAndAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB... ");

    const square = await Hospital.findOneAndUpdate(
      { email: "info@squarehospital.com" },
      {
        name: "Square Hospital",
        phone: "01711563214", 
        email: "info@squarehospital.com",
        address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, Panthapath, Dhaka 1205",
        licenseNumber: "SQ-HOS-2026-001",
      },
      { upsert: true, new: true }
    );
    console.log("Square Hospital verified/created.");

    const popular = await Hospital.findOneAndUpdate(
      { email: "info@popular-phc.com" },
      {
        name: "Popular Diagnostic Centre",
        phone: "01911563214",
        email: "info@popular-phc.com",
        address: "House #16, Road # 2, Dhanmondi, Dhaka-1205",
        licenseNumber: "POP-HOS-2026-002",
      },
      { upsert: true, new: true }
    );
    console.log("Popular Hospital verified/created.");

    const adminData = [
      {
        fullName: "Square Admin",
        email: "admin@square.com",
        password: process.env.SQUARE_ADMIN_PASSWORD, 
        hospital: square._id,
        adminId: "ADMIN-SQ001",
      },
      {
        fullName: "Popular Admin",
        email: "admin@popular.com",
        password: process.env.POPULAR_ADMIN_PASSWORD,
        hospital: popular._id,
        adminId: "ADMIN-POP001",
      }
    ];

    for (const data of adminData) {
      if (!data.password) {
        console.warn(`Warning: Missing password in .env for ${data.email}. Skipping...`);
        continue;
      }

      const existingAdmin = await Admin.findOne({ email: data.email });
      if (!existingAdmin) {
        await Admin.create(data);
        console.log(`Admin seeded for: ${data.fullName}`);
      } else {
        console.log(`Admin ${data.email} already exists.`);
      }
    }

    console.log("--- Seeding process finished successfully! ---");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedHospitalAndAdmins();