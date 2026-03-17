import { Router } from "express";
import {
  initializeRegistration,
  finalizeRegistration,
} from "../controllers/patient.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/initialize-registration")
  .post(upload.none(), initializeRegistration);

router.route("/finalize-registration").post(finalizeRegistration);

export default router;
