import {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user._id;

    const channel = await User.aggregate([
        {
            $match: {
                _id: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },{
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",    
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "videos._id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                totalVideos: {$size: "$videos"},
                totalSubscribers: {$size: "$subscribers"},
                totalLikes: {$size: "$likes"},
                totalViews: {$sum: "$videos.views"}
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                videos: 1,
                totalVideos: 1,
                subscribers: 1,
                totalSubscribers: 1,
                totalLikes: 1,
                totalViews: 1
            }
        }
    ])
    

    return res.status(200)
        .json(new ApiResponse(
            200, 
            channel[0], 
            "Channel stats fetched successfully with all the details."
        )
    );
});

export {getChannelStats};