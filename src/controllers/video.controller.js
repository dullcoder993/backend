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

const getAllVideos = asyncHandler(async(req,res,next)=>{

})

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
    console.log(videoFile.url)
    const Video = await video.create({
        title,
        discription,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner : req.user?._id
    })
    
    if(!Video){
        throw new ApiError(400,"Something went wrong.")
    }
    return res.status(201).json(
        new ApiResponse(201,Video,"Video uploded Successfully")
    )
})

export {publishVideo}