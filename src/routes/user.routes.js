import { Router } from "express";
import { changeUserPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, loguotUser, refreshAccessToken, registerUser, updateAvatar, updateCover, updateDetail } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, loguotUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeUserPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/change-detail").patch(verifyJWT,updateDetail)

router.route("/change-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)

router.route("/change-cover").patch(verifyJWT,upload.single("coverImage"),updateCover)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)


export default router