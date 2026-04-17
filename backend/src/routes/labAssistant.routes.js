import { Router } from "express";
import { 
    loginLabAssistant, 
    logoutLabAssistant,
    getLabDashboard,
    getPatientTests ,
    uploadDiagnosticReport
} from "../controllers/labAssistant.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, isLabAssistant } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginLabAssistant);

// Secured Routes
router.use(verifyJWT, isLabAssistant); 

router.route("/logout").post(logoutLabAssistant);
router.route("/dashboard").get(getLabDashboard);
router.route("/patient-tests/:patientId").get(getPatientTests);

router.route("/upload-report/:reportId").patch(
    upload.single("reportFile"), 
    uploadDiagnosticReport
);

export default router;