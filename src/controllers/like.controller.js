import {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if(existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"));
    }

    const newLike = new Like({
        video: videoId,
        likedBy: userId
    });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, null, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    
    const { commentId } = req.params;
    const userId = req.user._id;
    
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });
    
    if(existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"));
    }
    

    const videoId = await Comment.findById(commentId).select("video");

    const newLike = new Like({
        comment: commentId,
        likedBy: userId,
        video: videoId.video
    });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, null, "Comment liked successfully"));
})


const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    let { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const sortOrder = sortType === "asc" ? 1 : -1;

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true }  // Only fetch video likes
    })
        .populate("video", "title thumbnail views owner") // Recommended
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);

    const totalLikes = await Like.countDocuments({
        likedBy: userId,
        video: { $exists: true }
    });

    return res.status(200).json(
        new ApiResponse(200, {
            videos: likedVideos,
            totalLikes,
            currentPage: page,
            limit,
        }, "Liked videos fetched successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, getLikedVideos };