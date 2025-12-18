import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addComment, deleteComment, getComment, getCommentbyUser, updateComment } from "../controllers/comment.controller.js";

const router = Router()
router.use(verifyJWT)

router.route("/c/get-Comment/:id").post(getComment)

router.route("/add-Comment").post(addComment)

router.route("/c/update-comment/:id").patch(updateComment)

router.route("/c/delete-comment/:id").delete(deleteComment)

router.route("/getUserComment").get(getCommentbyUser)

export default router