import { Router } from "express";
import { 
    loginAdmin,
    logoutAdmin
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAdmin);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutAdmin);


export default router;



// router.route("/refresh-token").post(refreshAccessToken);