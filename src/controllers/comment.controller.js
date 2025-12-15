import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { comment } from "../models/comment.model.js";

const addComment = asyncHandler(async(req,res)=>{
    const {content,videoId} = req.body
    if(!content || !videoId){
        throw new ApiError(400,"Required field is empty.")
    }

    const Comment = await comment.create({
        content,
        video : videoId,
        owner : req.User?._id
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
    if(!content){
        throw new ApiError(400,"Content is required.")
    }
    if(!commentId){
        throw new ApiError(400,"commentId is required")
    }
    
    
    const Comment = await comment.findById(commentId)
    if(Comment.owner.id.equals(req.User._id)){
        throw new ApiError(400,"Can't update other people Comment.")
    }
    Comment.content = content
    await Comment.save()
    if(!Comment){
        throw new ApiError(400,"Comment not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,Comment,"Comment updated successfully.")
    )
})
const deleteComment = asyncHandler(async(req,res)=>{
    const commentId = req.params.body
    if(!commentId){
        throw new ApiError(400,"CommentId is required.")
    }
    if(comment.User.id !== req.User._id){
        throw new ApiError(400,"Can't delete the other people comments.")
    }
    const Comment = await comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Comment deleted Successfully.")
    )
    
})

export {addComment,updateComment,deleteComment}

