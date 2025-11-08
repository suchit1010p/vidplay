import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js"
import { json, response } from "express";
const registerUser = asyncHandler( async (req, res) => {
    // get user detail from frontend
    // validate - not empty
    // check if user already exists: usernam, email
    // check for image, check for avtar
    // upload them to cloudinary, avtar
    // create user object - create entry in db
    // remove password and refreshtoken field from responce 
    // check fro user creation
    // return res


    const { fullname, email, username, password } = req.body
    
    console.log("\n checking email present or not and with what name it is presennt : ", email)

    if([username, email, password, fullname].some((field)=> {field?.thrim()===""})){
        throw new ApiError(400, "all fields are required")
    }

    const existedUSer = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUSer) throw new ApiError(409, "User alreay exist with given username or email")



    
    console.log("\n req.file content check : \n", req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    console.log("\n checking avtar local adress")
    console.log(avatar)
    console.log("\n")

    if(!avatar) {
        throw new ApiError(400, "avatar file is required")
    }




    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    console.log("checking user is created or not \n")
    console.log(user)

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    console.log("\n")
    
    return res.status(201, json(
        new ApiResponce(200, createdUser, `User ${createdUser.username} registered successfully`)
    ))

} )


export {registerUser}