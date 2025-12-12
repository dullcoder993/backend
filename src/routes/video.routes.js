import { Router } from "express";
import { getAllVideos, publishVideo, updateThumbnail, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route("/video").post(
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishVideo
);
router.route("/get-videos").get(getAllVideos)

router.route("/c/change-details/:id").put(updateVideo)

router.route("/c/change-thumbnail/:id").patch(upload.single("thumbnail"),updateThumbnail)



export default router
