import { Router } from "express";
import { 
    loginLabAssistant, 
    logoutLabAssistant,

} from "../controllers/labAssistant.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginLabAssistant);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutLabAssistant);


export default router;