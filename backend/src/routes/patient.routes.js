import { Router } from "express";
import {
  initializeRegistration,
  finalizeRegistration,
  loginPatient,
  logoutPatient,
  refreshAccessToken,
  getPatientProfile,
  updatePatientProfile,
  changeCurrentPassword
} from "../controllers/patient.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/initialize-registration")
  .post(upload.none(), initializeRegistration);

router.route("/finalize-registration").post(finalizeRegistration);
router.route("/login").post(loginPatient);
router.route("/logout").post(verifyJWT, logoutPatient);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/profile").get(verifyJWT, getPatientProfile);
router.route("/update-profile").patch(
    verifyJWT, 
    upload.single("profilePhoto"), // 'profilePhoto' must match the frontend name
    updatePatientProfile
);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);


export default router;
