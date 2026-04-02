import { Router } from "express";
import {
  initializeRegistration,
  finalizeRegistration,
  loginPatient,
  logoutPatient,
  getPatientProfile,
  updatePatientProfile,
  changeCurrentPassword
} from "../controllers/patient.controller.js";
import{ 
  addPatientPrescription, 
  deletePrescription, 
  getPatientPrescriptions 
} from "../controllers/prescription.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

//from patient.controller.js
router
  .route("/initialize-registration")
  .post(upload.none(), initializeRegistration);

router.route("/finalize-registration").post(finalizeRegistration);
router.route("/login").post(loginPatient);
router.route("/logout").post(verifyJWT, logoutPatient);
router.route("/profile").get(verifyJWT, getPatientProfile);
router.route("/update-profile").patch(
    verifyJWT, 
    upload.single("profilePhoto"), // 'profilePhoto' must match the frontend name
    updatePatientProfile
);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

//from prescription.controller.js
router.route("/prescriptions/:patientId?").get(verifyJWT, getPatientPrescriptions);
router.route("/prescriptions").post(
    verifyJWT, 
    upload.single("prescriptionFile"), 
    addPatientPrescription
);
router.route("/prescriptions/:id").delete(verifyJWT, deletePrescription);

export default router;


