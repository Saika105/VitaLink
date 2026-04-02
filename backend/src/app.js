import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


//middlewares--- check are user capable of doing the request
app.use(cors({
    origin: [
        process.env.CORS_ORIGIN, 
        "http://localhost:8000"  
    ],
    credentials: true
}));

app.use(express.json({limit: "1mb"})) 
app.use(express.urlencoded({extended: true, limit: "1mb"})) 
app.use(express.static("public")) 
app.use(cookieParser()) 


//DB


//**Routes import
import patientRouter from "./routes/patient.routes.js";
import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import doctorAssistantRouter from "./routes/doctorAssistant.routes.js";
import labAssistantRouter from "./routes/labAssistant.routes.js";
import receptionistRouter from "./routes/receptionist.routes.js";



//***routes declaration 
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/doctor-assistants", doctorAssistantRouter);
app.use("/api/v1/lab-assistants", labAssistantRouter);
app.use("/api/v1/receptionists", receptionistRouter);

// http://localhost:8000/api/v1/patients/initialize-registration
// http://localhost:8000/api/v1/admins/
// http://localhost:8000/api/v1/auth/
// http://localhost:8000/api/v1/doctors/
// http://localhost:8000/api/v1/doctor-assistants/
// http://localhost:8000/api/v1/lab-assistants/
// http://localhost:8000/api/v1/receptionists/


export { app }