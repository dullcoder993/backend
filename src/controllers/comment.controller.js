import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { comment } from "../models/comment.model.js";


const getComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const Comments = await comment.find({ Video: videoId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    return res.status(200).json(
        new ApiResponse(200, Comments, "Comments fetched successfully")
    );
});

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
    const checkOwner = Comment.owner == req.User.id
    if(!checkOwner){
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
    const commentId = req.params.id
    if(!commentId){
        throw new ApiError(400,"CommentId is required.")
    }
    const Comment = await comment.findById(commentId)
    const checkOwner = Comment.owner == req.User.id
    if(!checkOwner){
        throw new ApiError(400,"Can't delete the other people comments.")
    }
    await Comment.deleteOne();

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Comment deleted Successfully.")
    )
    
})

const getCommentbyUser = asyncHandler(async (req,res)=>{
    const { page = 1, limit = 10 } = req.query;

    const Comment = await comment.find({owner : req.User.id })
    .sort({createdAt: -1})
    return res
    .status(200)
    .json(
        new ApiResponse(200,Comment,"Comments fetched Successfully.")
    )
})

export {getComment,addComment,updateComment,deleteComment,getCommentbyUser}

