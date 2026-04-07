import { Router } from "express";
import { 
    loginDoctor,
    logoutDoctor,
} from "../controllers/doctor.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT , isDoctor} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginDoctor);

// Secured Routes
router.route("/logout").post(verifyJWT, isDoctor, logoutDoctor);

export default router;