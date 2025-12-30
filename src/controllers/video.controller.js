import mongoose, {isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {uploadOnCloudinary, deleteOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponce.js"

const getAllVideos = asyncHandler(async (req, res) => {
    let { pages = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    // Convert to number safely
    pages = Math.max(Number(pages) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 10, 1), 50); 
    // limit max is 50 => protects server load

    const filter = {};

    // Validate search input
    if (query) {
        if (query.length > 50) {
            throw new ApiError(400, "Search query too long");
        }
        filter.title = { $regex: query, $options: "i" };
    }

    // Validate userId before filtering
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId format");
        }
        filter.owner = userId;
    }

    // Whitelist allowed sorting fields
    const allowedSort = ["createdAt", "views", "title"];
    if (!allowedSort.includes(sortBy)) {
        sortBy = "createdAt";
    }

    const sortOrder = sortType === "asc" ? 1 : -1;

    // DB Query
    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((pages - 1) * limit)
        .limit(limit);

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            totalVideos,
            currentPage: pages,
            limit,
            hasNextPage: pages * limit < totalVideos,
            totalPages: Math.ceil(totalVideos / limit),
        }, "Videos fetched successfully")
    );
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

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username avatar coverImage ");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    
    const { title, description } = req.body;

    if (title) video.title = title;
    if (description) video.description = description;
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    const videoURL = video.videoFile;
    const thumbnailURL = video.thumbnail;

    await Video.findByIdAndDelete(videoId);

    // Delete video and thumbnail from Cloudinary
    const videoDeletionResult = await deleteOnCloudinary(videoURL);
    const thumbnailDeletionResult = await deleteOnCloudinary(thumbnailURL);

    return res.status(200).json(new ApiResponse(200, {videoDeletionResult, thumbnailDeletionResult}, "Video deleted successfully"));

})

export {
    publishAVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo
}