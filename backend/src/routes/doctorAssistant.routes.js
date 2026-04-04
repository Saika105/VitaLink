import { Router } from "express";
import {
  loginAssistant,
  logoutAssistant,
  searchPatientByUPID,
  addAppointmentToQueue,
  getDailyAppointmentList,
  updateQueueStatus,
  uploadPrescriptionByAssistant,
  clearDailyQueue,
  scheduleFollowUp,
  checkInPatient,
} from "../controllers/doctorAssistant.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT , isDoctorAssistant} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAssistant);

// Secured Routes
router.route("/logout").post(verifyJWT, isDoctorAssistant, logoutAssistant);

// Queue
router.route("/search-patient/:upid").get(verifyJWT, isDoctorAssistant, searchPatientByUPID);
router.route("/add-to-queue").post(verifyJWT, isDoctorAssistant, addAppointmentToQueue);

// Daily management routes
router.route("/daily-list").get(verifyJWT, isDoctorAssistant, getDailyAppointmentList);
router.route("/clear-session").patch(verifyJWT, isDoctorAssistant, clearDailyQueue);

// Specific Actions
router.route("/check-in/:appointmentId").patch(verifyJWT, isDoctorAssistant, checkInPatient);
router.route("/status/:appointmentId").patch(verifyJWT, isDoctorAssistant, updateQueueStatus);
router.route("/follow-up/:appointmentId").post(verifyJWT, isDoctorAssistant, scheduleFollowUp);

// Upload prescription
router.route("/upload-rx/:appointmentId").post(
  verifyJWT, 
  isDoctorAssistant,
  upload.single("prescriptionFile"), 
  uploadPrescriptionByAssistant
);

export default router;
