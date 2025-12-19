import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/getUser").get(getUserTweet)

router.route("/add").post(addTweet)

router.route("/c/update/:id").patch(updateTweet)

router.route("/c/delete/:id").delete(deleteTweet)

export default router