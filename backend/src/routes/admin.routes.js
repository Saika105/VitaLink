import { Router } from "express";
import { 
    loginAdmin,
    logoutAdmin,
    createDoctor,
    createDoctorAssistant,
    createLabAssistant,
    createReceptionist,
    getHospitalStaff,
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
router.route("/register-lab-assistant").post(
    verifyJWT, 
    upload.none(), 
    createLabAssistant
);
router.route("/register-receptionist").post(
    verifyJWT, 
    upload.none(), 
    createReceptionist
);
router.route("/staff").get(verifyJWT, getHospitalStaff);



export default router;



// router.route("/refresh-token").post(refreshAccessToken);