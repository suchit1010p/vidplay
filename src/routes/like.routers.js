import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoLike, toggleCommentLike, getLikedVideos } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

// Protect only needed routes
router.post("/video/:videoId", toggleVideoLike);
router.post("/comment/:commentId", toggleCommentLike);
router.get("/videos", getLikedVideos);

export default router;