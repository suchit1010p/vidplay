import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express"

// Load environment variables from the project root .env file
dotenv.config()
 
connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log("server is running")
    })
})
.catch((error) => {
    console.log(`MongoDB connection fail !!!`, error)
})
