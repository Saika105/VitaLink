import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


//middlewares--- check are user capable of doing the request
app.use(cors({
    origin: process.env.CORS_ORIGIN, //***which origins i am allowing
    credentials: true
})) 

app.use(express.json({limit: "16kb"})) 
app.use(express.urlencoded({extended: true, limit: "16kb"})) 
app.use(express.static("public")) 
app.use(cookieParser()) 


//DB


//**Routes import
import patientRouter from "./routes/patient.routes.js";
import adminRouter from "./routes/admin.routes.js";



//***routes declaration 
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/admins", adminRouter);

// http://localhost:8000/api/v1/patients/initialize-registration
// http://localhost:8000/api/v1/admins/


export { app }