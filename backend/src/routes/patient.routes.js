import { Router } from "express";
import {
  initializeRegistration,
  finalizeRegistration,
  loginPatient,
  logoutPatient,
  refreshAccessToken,
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

export default router;
