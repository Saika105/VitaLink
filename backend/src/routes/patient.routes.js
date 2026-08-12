import { Router } from "express";
import cors from "cors";
import {
  initializeRegistration,
  finalizeRegistration,
  loginPatient,
  logoutPatient,
  getPatientProfile,
  updatePatientProfile,
  changeCurrentPassword,
  getAllDoctors,
  getPatientAppointments,
  cancelAppointment,
  getAssistantContactForReschedule,
  bulkDeleteAppointments,
  getBillingOverview,
  payBillOnline,
  initiateBillPayment,
  paymentSuccessCallback,
  paymentFailureCallback
} from "../controllers/patient.controller.js";
import{ 
  addPatientPrescription, 
  deletePrescription, 
  getPatientPrescriptions 
} from "../controllers/prescription.controller.js";
import { 
  addPatientLabReport , 
  deletePatientLabReport , 
  getPatientLabReports 
} from "../controllers/labReport.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT , isPatient} from "../middlewares/auth.middleware.js";


const router = Router();

//from patient.controller.js
router.route("/initialize-registration").post(upload.none(), initializeRegistration);
router.route("/finalize-registration").post(finalizeRegistration);
router.route("/login").post(loginPatient);

router.route("/logout").post(verifyJWT, isPatient, logoutPatient);
router.route("/profile").get(verifyJWT, isPatient, getPatientProfile);
router.route("/update-profile").patch(
    verifyJWT, 
    isPatient,
    upload.single("profilePhoto"),
    updatePatientProfile
);
router.route("/change-password").post(verifyJWT, isPatient, changeCurrentPassword);
router.route("/doctors").get(verifyJWT, isPatient, getAllDoctors);
router.route("/my-appointments").get(verifyJWT, isPatient, getPatientAppointments);
router.route("/cancel-appointment/:appointmentId").patch(verifyJWT, isPatient, cancelAppointment);
router.route("/reschedule-info/:appointmentId").get(verifyJWT, isPatient, getAssistantContactForReschedule);
router.route("/delete-appointments").delete(verifyJWT, isPatient, bulkDeleteAppointments);

//from prescription.controller.js
router.route("/prescriptions/add").post(
    verifyJWT, 
    isPatient,
    upload.single("prescriptionFile"), 
    addPatientPrescription
);
router.route("/prescriptions/delete/:id").delete(verifyJWT, isPatient, deletePrescription);
router.route("/prescriptions").get(verifyJWT, isPatient, getPatientPrescriptions);

//from labReport.controller.js
router.route("/lab-reports/add").post(
    verifyJWT, 
    isPatient,
    upload.single("reportFile"), 
    addPatientLabReport
);
router.route("/lab-reports/delete/:id").delete(verifyJWT, isPatient, deletePatientLabReport);
router.route("/lab-reports").get(verifyJWT, isPatient, getPatientLabReports);

router.route("/billing-overview").get(verifyJWT, isPatient, getBillingOverview);
// router.route("/pay-online").post(verifyJWT, isPatient, payBillOnline);
router.route("/initiate-payment").post(verifyJWT, initiateBillPayment);

// SSLCommerz callback routes — cors() allows POST from SSLCommerz servers
router.route("/payment-callback/success/:billId").post(cors(), paymentSuccessCallback);
router.route("/payment-callback/fail/:billId").post(cors(), paymentFailureCallback);
router.route("/payment-callback/cancel/:billId").post(cors(), paymentFailureCallback);
router.post("/payment-callback/ipn/:billId", paymentFailureCallback);

export default router;