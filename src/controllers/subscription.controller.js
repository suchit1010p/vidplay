import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { isValidObjectId } from "mongoose";


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username fullName avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { userId } = req.params; // FIXED

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const subscribedTo = await Subscription.find({ subscriber: userId })
        .populate("channel", "username fullName avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedTo, "Subscribed channels fetched successfully"));
});


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Prevent subscribing to own channel
    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unsubscribed successfully"));
    }

    const newSubscription = await Subscription.create({
        subscriber: userId,
        channel: channelId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
});

export {
    getUserChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription
}
