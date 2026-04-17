import { Router } from "express";
import { 
    loginReceptionist, 
    logoutReceptionist, 
    findPatientByUpid, 
    searchTestsForBilling, 
    createTestInvoice,
} from "../controllers/receptionist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isReceptionist } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.route("/login").post(loginReceptionist);

// Secured Routes
router.use(verifyJWT, isReceptionist); 

router.route("/logout").post(logoutReceptionist);
router.route("/search-patient").get(findPatientByUpid);
router.route("/search-tests").get(searchTestsForBilling);
router.route("/create-invoice").post(createTestInvoice);


export default router;