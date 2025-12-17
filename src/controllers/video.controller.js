import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { video } from "../models/video.model.js";

dotenv.config

const publishVideo = asyncHandler(async(req,res)=>{
    const {title,discription} = req.body
    if(!title || !discription){
        throw new ApiError(400,"Title and Discription is required.")
    }

    let videoLocalPath = req.files?.videoFile[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"Video file required.")
    }
    videoLocalPath = path.resolve(videoLocalPath)
    const fixedVideoPath = videoLocalPath.replace(/\\/g,"/")
    const videoFile = await uploadOnCloudinary(fixedVideoPath)
    if(!videoFile){
        throw new ApiError(400,"Video file required, retry.")
    }

    let thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required.")
    }
    thumbnailLocalPath = path.resolve(thumbnailLocalPath)
    const fixedThumbnailPath = thumbnailLocalPath.replace(/\\/g,"/")
    const thumbnail = await uploadOnCloudinary(fixedThumbnailPath)
    if(!thumbnail){
        throw new ApiError(400,"Thumbnail is required, retry.")
    }
    const Video = await video.create({
        title,
        discription,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner : req.User?._id
    })
    
    if(!Video){
        throw new ApiError(400,"Something went wrong.")
    }
    return res.status(201).json(
        new ApiResponse(201,Video,"Video uploded Successfully")
    )
})

const getAllVideos = asyncHandler(async(req,res)=>{
    const videos = await video.find({})
    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"All video fetched successfully.")
    )
})
const updateVideo = asyncHandler(async(req,res)=>{
    const {title,discription} = req.body
    if(!title && !discription){
        throw new ApiError(400,"required field is empty")
    }
    const videoId = req.params.id
    if(!videoId){
        throw new ApiError(400,"Video Id required.")
    }
    
    const Video = await video.findById(videoId)
    console.log(Video)
    const checkOwner = Video.owner == req.User.id
    if(!checkOwner){
        throw new ApiError(400,"Cannot edit other user video")
    }
    Video.title = title
    Video.discription = discription
    await Video.save()
    if(!Video){
        throw new ApiError(400,"Video is not found.")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,Video,"Video details updated successfully.")
    )
})
const updateThumbnail = asyncHandler(async(req,res)=>{
    const videoId =req.params.id
    if(!videoId){
        throw new ApiError(400,"Video Id required.")
    } 
    const Video = await video.findById(videoId)
    if(!Video){
        throw new ApiError(400,"Video is not found.")
    }
    const checkOwner = Video.owner == req.User.id
    if(!checkOwner){
        throw new ApiError(400,"Can't change details.")
    }
    const thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail file is required.")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw new ApiError(400,"Something went wrong while uploading document. Retry.")
    }
    Video.thumbnail = thumbnail.url;
    await Video.save();

    
    return res
    .status(200)
    .json(
        new ApiResponse(200,Video,"Thumbnail changed successfully")
    )
})

const getVideoById = asyncHandler(async(req,res)=>{
    const videoId = req.params.id
    if(!videoId){
        throw new ApiError(400,"Video Id required .")
    }
    const Video = await video.findById(
        videoId
    )
    if(!Video){
        throw new ApiError(400,"Video is not found")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(201,Video,"Video details fetched Successfully.")
    )
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const videoId = req.params.id
    if(!videoId){
        throw new ApiError(400,"Video Id required.")
    }
    const Video = await video.findById(
        videoId
    )
    const checkOwner = Video.owner == req.User.id
    if(!checkOwner){
        throw new ApiError(400,"Cannot delete other user video")
    }
    await Video.deleteOne()
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video deleted successfully")
    )
})
export {publishVideo, updateVideo,getAllVideos,updateThumbnail,getVideoById,deleteVideo}