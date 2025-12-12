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
        owner : req.user?._id
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
    const Video = await video.findByIdAndUpdate(
        req.params.id,
        {
            $set:{
                title,
                discription
            }
        },
        {new:true}
    )
    console.log(Video)
    return res
    .status(200)
    .json(
        new ApiResponse(200,Video,"Video details updated successfully.")
    )
})
const updateThumbnail = asyncHandler(async(req,res)=>{
    const thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail file is required.")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw new ApiError(400,"Something went wrong while uploading document. Retry.")
    }
    const Video = await video.findByIdAndUpdate(
        req.params.id,
        {
            $set:{
                thumbnail: thumbnail.url
            }
        },
        {new:true}
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,Video,"Thumbnail changed successfully")
    )
})
export {publishVideo, updateVideo,getAllVideos,updateThumbnail}