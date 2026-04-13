import { Router } from "express";
import { 
    loginAdmin,
    logoutAdmin,
    createDoctor,
    createDoctorAssistant,
    createLabAssistant,
    createReceptionist,
    getHospitalStaff,
    deleteStaff,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT , isAdmin} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAdmin);

// Secured Routes
router.route("/logout").post(verifyJWT, isAdmin, logoutAdmin);
router.route("/register-doctor").post(
    verifyJWT, 
    isAdmin,
    upload.single("profilePhoto"), 
    createDoctor
);
router.route("/register-assistant").post(
    verifyJWT, 
    isAdmin,
    upload.none(), 
    createDoctorAssistant
);
router.route("/register-lab-assistant").post(
    verifyJWT, 
    isAdmin,
    upload.none(), 
    createLabAssistant
);
router.route("/register-receptionist").post(
    verifyJWT,
    isAdmin,
    upload.none(), 
    createReceptionist
);
router.route("/staff").get(verifyJWT, isAdmin, getHospitalStaff);
router.route("/staff/:id").delete(verifyJWT, isAdmin, deleteStaff);

export default router;



// router.route("/refresh-token").post(refreshAccessToken);