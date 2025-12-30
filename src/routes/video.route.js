import { Router } from 'express';
import { getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo
} from '../controllers/video.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';


const router = Router();


//upload video 

router.route("/publishVideo").post(
    verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {   
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo)
router.route("/:videoId").get(getVideoById)
router.route("/:videoId").patch(verifyJWT, updateVideo)
router.route("/:videoId").delete(verifyJWT, deleteVideo)
router.route("/").get(getAllVideos)

export default router;