import { Router } from "express";
import { 
    loginAdmin,
    logoutAdmin,
    refreshAccessToken
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAdmin);
router.route("/refresh-token").post(refreshAccessToken);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutAdmin);


export default router;