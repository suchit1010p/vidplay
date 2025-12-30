import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// cors : a mechanism that allows web application to access resources from different domains. 


// limiting the request so that surver can hold the load 
app.use(express.json({limit:"16kb"}))
// exncode url data and put it in object form  
app.use(express.urlencoded({extended: true, limit: "16kb"}))
// stors static files in public
app.use(express.static("public"))

app.use(cookieParser())




// routes
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.route.js"


//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)

export {app}