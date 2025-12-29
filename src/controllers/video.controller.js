import mongoose, {isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const {pages = 1, limit = 10, query, sortBy, sortType, userId} = req.query;

    // 
});

const publishAVideo = asyncHandler(async (req, res) => {

    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video not found, please upload the video");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail not found, please upload the thumbnail");
    }

    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required to publish a video");
    }

    // Upload video and thumbnail to Cloudinary
    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoUpload?.url) {
        throw new ApiError(500, "Something went wrong while uploading the video");
    }

    if (!thumbnailUpload?.url) {
        throw new ApiError(500, "Something went wrong while uploading the thumbnail");
    }

    const duration = videoUpload?.duration || 0; // Cloudinary gives duration in seconds

    const newVideo = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        duration,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponce(201, newVideo, "Video published successfully"));
});



export {
    publishAVideo,
}