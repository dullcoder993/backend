import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addVideo, createPlaylist, deletePlaylist, getUserPlaylist, removeVideo, updatePlaylist } from "../controllers/playlist.controller";

const router = Router()
router.use(verifyJWT)

router.route("/create").post(createPlaylist)

router.route("/add/:playlistId/:VideoId").post(addVideo)

router.route("/remove/:playlistId/:VideoId").delete(removeVideo)

router.route("/c/update/:id").patch(updatePlaylist)

router.route("/c/delete/:id").delete(deletePlaylist)

router.route("/getUser").get(getUserPlaylist)

export default router