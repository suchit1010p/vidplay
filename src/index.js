import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"

// Load environment variables from the project root .env file
dotenv.config({
    path: './.env'
})
 
connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log("server is running")
    })
})
.catch((error) => {
    console.log(`MongoDB connection fail !!!`, error)
})
