// Load environment variables once for the whole app
import "./config.js";
import connectDB from "./db/index.js";
import { app } from "./app.js"
 
connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log("server is running")
    })
})
.catch((error) => {
    console.log(`MongoDB connection fail !!!`, error)
})
