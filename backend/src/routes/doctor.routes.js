import { Router } from "express";
import {
  loginDoctor,
  logoutDoctor,
  getTodayAppointments,
  verifyPatientStart,
  startConsultationSession,
  getPatientProfileForDoctor,
  createDigitalPrescription,
} from "../controllers/doctor.controller.js";
import { searchPatientByUPID } from "../controllers/doctorAssistant.controller.js";
import { getPatientPrescriptions } from "../controllers/prescription.controller.js";
import { getPatientLabReports } from "../controllers/labReport.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, isDoctor } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginDoctor);

// Secured Routes
//from doctor.controller.js
router.route("/logout").post(verifyJWT, isDoctor, logoutDoctor);
router.route("/today-queue").get(verifyJWT, isDoctor, getTodayAppointments);
router.route("/verify-patient/:appointmentId").get(verifyJWT, isDoctor, verifyPatientStart);
router.route("/start-session/:appointmentId").patch(verifyJWT, isDoctor, startConsultationSession);
router.route("/patient-profile/:patientId").get(verifyJWT, isDoctor, getPatientProfileForDoctor);

//from doctorAssistant.controller.js
router.route("/search-patient/:upid").get(verifyJWT, isDoctor, searchPatientByUPID);

router
  .route("/sign-prescription/:appointmentId")
  .post(verifyJWT, isDoctor, upload.single("prescriptionFile"), createDigitalPrescription);

//from prescription.controller.js
router.route("/prescriptions/get/:patientId").get(verifyJWT, isDoctor, getPatientPrescriptions); 

//from labReport.controller.js
router.route("/lab-reports/get/:patientId").get(verifyJWT, isDoctor, getPatientLabReports);

export default router;
