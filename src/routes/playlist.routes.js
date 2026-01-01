import Router from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist 
} from '../controllers/playlist.controller.js';

const router = Router();

router.use(verifyJWT);


router.route("/")
    .post(createPlaylist)
    .get(getUserPlaylists);

router.route('/:playlistId')
    .get(getPlaylistById)
    .delete(deletePlaylist)
    .patch(updatePlaylist);

router.post('/:playlistId/videos/:videoId', addVideoToPlaylist);
router.delete("/:playlistId/videos/:videoId", removeVideoFromPlaylist);

export default router;