import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { comment } from "../models/comment.model.js";

const addComment = asyncHandler(async(req,res)=>{
    const {comment,videoId} = req.body
    if(!comment || !videoId){
        throw new ApiError(400,"Required field is empty.")
    }
    const Comment = await comment.create({
        content,
        video : videoId,
        owner : req.user?._id
    })
    if(!Comment){
        throw new ApiError(400,"Something went wrong.")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,Comment,"Comment added Successfully.")
    )
})

const updateComment = asyncHandler(async(req,res)=>{
    const {content} = req.body
    const commentId = req.params.id
    if(!commentId){
        throw new ApiError(400,"commentId is required")
    }
    const Comment = await comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {new : true}
    )
    if(!Comment){
        throw new ApiError(400,"Comment not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,Comment,"Comment updated successfully.")
    )
})


export {addComment,updateComment}

