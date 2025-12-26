import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDNIARY_CLOUD_NAME,
    api_key: process.env.CLOUDNIARY_API_KEY,
    api_secret: process.env.CLOUDNIARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOnCloudinary = async(cloudinaryUrl) => {
    try {
        if(!cloudinaryUrl) return null

        // Extract public_id from cloudinary URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/public_id.ext
        const urlParts = cloudinaryUrl.split("/")
        const fileName = urlParts[urlParts.length - 1]
        const public_id = fileName.split(".")[0]

        // Delete from cloudinary
        const result = await cloudinary.uploader.destroy(public_id);
        if (!result) return null;
        return result;

        return { success: true }
        
    } catch (error) {
        throw new ApiError(400, "Error deleting image from cloudinary")
    }
}


export {uploadOnCloudinary, deleteOnCloudinary}