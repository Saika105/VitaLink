import { Router } from "express";
import { 
    loginAdmin,
    logoutAdmin,
    createDoctor,
    createDoctorAssistant
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAdmin);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutAdmin);
router.route("/register-doctor").post(
    verifyJWT, 
    upload.single("profilePhoto"), 
    createDoctor
);
router.route("/register-assistant").post(
    verifyJWT, 
    upload.none(), 
    createDoctorAssistant
);


export default router;



// router.route("/refresh-token").post(refreshAccessToken);