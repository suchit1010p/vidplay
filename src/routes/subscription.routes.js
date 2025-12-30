import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getUserChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription
} from "../controllers/subscription.controller.js";

const router = Router();

// Protect only needed routes
router.post("/toggle/:channelId", verifyJWT, toggleSubscription);

router.get("/channel/:channelId", getUserChannelSubscribers);

router.get("/user/:userId", verifyJWT, getSubscribedChannels);

export default router;
