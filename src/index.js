import dotenv from "dotenv";
import connectDB from "./db/index.js";


// Load environment variables from the project root .env file
dotenv.config()
 
connectDB()
