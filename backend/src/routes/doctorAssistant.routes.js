import { Router } from "express";
import { loginAssistant, logoutAssistant } from "../controllers/doctorAssistant.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAssistant);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutAssistant);

export default router;