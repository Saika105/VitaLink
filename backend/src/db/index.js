import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        const connectionString = mongoUri.includes(`/${DB_NAME}`)
            ? mongoUri
            : `${mongoUri}/${DB_NAME}`;

        const connectionInstance = await mongoose.connect(connectionString);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error HEREEEEE: ", error);
        process.exit(1);
    }
};

export default connectDB;