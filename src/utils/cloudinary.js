import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
        cloud_name: process.env.CLOUDNIARY_CLOUD_NAME, 
        api_key: process.env.CLOUDNIARY_API_KEY, 
        api_secret: CLOUDNIARY_API_SECRET 
    });


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        //upload the file on cloudniary
        const responce = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //file has been uploaded successfully

        console.log("file is uploaded on cloudinary", responce.url)


        return responce;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove locally saved temp file as the upload opration got failed

        return null;
    }
}

export {uploadOnCloudinary}