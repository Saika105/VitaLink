import { Router } from "express";
import { 
    loginReceptionist, 
    logoutReceptionist 
} from "../controllers/receptionist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginReceptionist);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutReceptionist);


export default router;