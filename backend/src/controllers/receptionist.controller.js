import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Receptionist } from "../models/receptionist.model.js";
import { Patient } from "../models/patient.model.js";
import { Bill } from "../models/bill.model.js";
import { LabReport } from "../models/labReport.model.js";
import { DiagnosticTest } from "../models/diagnosticTest.model.js";
import { LabRoom } from "../models/labRoom.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//*************Receptionist login ********** */
const loginReceptionist = asyncHandler(async (req, res) => {
  const { receptionistId, password } = req.body;

  if (!receptionistId || !password) {
    throw new ApiError(400, "Receptionist ID and password are required");
  }

  const receptionist = await Receptionist.findOne({ receptionistId }).select(
    "+password",
  );

  if (!receptionist) {
    throw new ApiError(401, "Invalid Receptionist ID or password");
  }

  const isPasswordValid = await receptionist.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Receptionist ID or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    receptionist._id,
    "receptionist",
  );

  const loggedInReceptionist = await Receptionist.findById(
    receptionist._id,
  ).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInReceptionist,
          token: accessToken,
        },
        "Receptionist logged in successfully",
      ),
    );
});

//*************Receptionist logout ********** */
const logoutReceptionist = asyncHandler(async (req, res) => {
  console.log(
    `Receptionist Logging Out: ${req.user?.fullName} (ID: ${req.user?._id})`,
  );

  await Receptionist.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Receptionist logged out successfully"));
});

//*************search patient by UPID ********** */
const findPatientByUpid = asyncHandler(async (req, res) => {
    const { upid } = req.query;

    if (!upid) {
        throw new ApiError(400, "Patient UPID is required for search");
    }

    const patient = await Patient.findOne({ upid: upid.toUpperCase().trim() }).select(
        "fullName upid gender age phone profilePhoto"
    );

    if (!patient) {
        throw new ApiError(404, "No patient found with this VitaLink ID");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, patient, "Patient record located"));
});

//*************Search Diagnostic Tests (Fetches room details automatically) ********** */
const searchTestsForBilling = asyncHandler(async (req, res) => {
    const { name } = req.query;

    const tests = await DiagnosticTest.find({
        name: { $regex: name || "", $options: "i" }
    })
    .populate("room", "roomNumber floor")
    .limit(10);

    return res
        .status(200)
        .json(new ApiResponse(200, tests, "Tests and rooms fetched successfully"));
});

//*************Create Test Order / Invoice ***********/
const createTestInvoice = asyncHandler(async (req, res) => {
    const { patientId, testItems, paidAmount, paymentMethod } = req.body;

    if (!patientId || !testItems || testItems.length === 0) {
        throw new ApiError(400, "Patient ID and selected tests are required");
    }

    let calculatedTotal = 0;
    const validatedItems = await Promise.all(testItems.map(async (item) => {
        const testData = await DiagnosticTest.findOne({ name: item.testName });
        
        if (!testData) {
            throw new ApiError(404, `Test '${item.testName}' not found in hospital directory`);
        }

        calculatedTotal += testData.price;
        return {
            name: testData.name,
            price: testData.price,
            roomId: testData.room 
        };
    }));

    const isFullyPaid = Number(paidAmount) >= calculatedTotal;

    const createdReports = await Promise.all(validatedItems.map(async (item) => {
        const uniqueId = `REP-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

        return await LabReport.create({
            reportId: uniqueId,
            patient: patientId,
            hospital: req.user.hospital, 
            testName: item.name,
            price: item.price,
            room: item.roomId, 
            isPaid: isFullyPaid, 
            source: "lab_assistant"
        });
    }));

    const billItems = validatedItems.map(item => ({
        itemType: "labtest", 
        description: item.name, 
        quantity: 1,
        unitPrice: item.price,
        amount: item.price,
    }));

    const bill = await Bill.create({
        invoiceNumber: `INV-${Math.random().toString(36).toUpperCase().slice(2, 10)}`, 
        patient: patientId,
        hospital: req.user.hospital,
        receptionist: req.user._id,
        labReports: createdReports.map(r => r._id),
        items: billItems, 
        totalAmount: calculatedTotal, 
        payments: Number(paidAmount) > 0 ? [{
            amount: Number(paidAmount),
            method: paymentMethod || "cash", 
            paidAt: new Date()
        }] : [],
        discount: 0
    });

    return res.status(201).json(
        new ApiResponse(201, { bill, reports: createdReports }, "Invoice generated successfully")
    );
});

export {
    loginReceptionist,
    logoutReceptionist,
    findPatientByUpid,
    searchTestsForBilling,
    createTestInvoice
};
