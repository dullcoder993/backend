import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { playlist } from "../models/playlist.model.js";
import { video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,discription} = req.body
    if(!name || !discription){
        throw new ApiError(400,"Required field is Empty.")
    }
    const Playlist = await playlist.create(
        {
            name,
            discription,
            owner:req.User.id,
            videos
        }
    )
    if(!Playlist){
        throw new ApiError(400,"Playlist not created.")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,Playlist,"Playlist created Successfully.")
    )
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const playlistId = req.params.id
    if(!playlistId){
        throw new ApiError(400,"playlist id required.")
    }
    const {name,discription} = req.body
    if(!name && !discription){
        throw new ApiError(400,"Required field is empty.")
    }
    const playlistOwner = req.User.id
    const Playlist = await playlist.findById(playlistId)
    const checkOwner = playlistOwner == playlist.owner.id

    if(!checkOwner){
        throw new ApiError(400,"Can't update other people playlist.")
    }
    if(name){
        Playlist.name = name
    }
    if(discription){
        Playlist.discription = discription
    }
    await Playlist.save()
    return res
    .status(200)
    .json(
        new ApiResponse(200,Playlist,"Playlist updated successfully.")
    )
})

const getUserPlaylist = asyncHandler(async(req,res)=>{
    const playlistId = req.params.id
    if(!playlistId){
        throw new ApiError(400,"Playlist Id requird.")
    }
    const Play = await playlist.aggregate([
        {
           $match:{
            _id : new mongoose.Types.ObjectId(playlistId)
           }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "videos.owner",
                foreignField: "_id",
                as: "videoOwners"
            }
        },
        {
            $addFields:{
                videos: {
                    $map:{
                        input : "$videos",
                        as:"video",
                        in:{
                            _id : "$$video._id",
                            title: "$$video.title",
                            thumbnail:"$$video.thumbnail",
                            owner: {
                                $arrayElemAt : [
                                    {
                                        $filter : {
                                            input : "$videoOwners",
                                            as : "user",
                                            cond:{
                                                $eq:["$$user._id","$$video.owner"]
                                            }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                }
            }
        },
    ])
    if(!Play.length){
    throw new ApiError(400,"Something went wrong.")
    }
    return res
    .status(200)
    .json(
        200,Play[0],"Plaulist fetched successfully."
    )
})

const addVideo = asyncHandler(async(req,res)=>{
    const {playlistId , VideoId } = req.params.id
    if(!playlistId || !VideoId){
        throw new ApiError(400,"Id are required.")
    }
    const Playlist = await playlist.findById(playlistId)
    if(!Playlist){
        throw new ApiError(400,"Playlist is not exist.")
    }
    const Videoexist = await video.exists({id:VideoId})
    if(!Videoexist){
        throw new ApiError(400,"Video not exist.")
    }
    const VideoExistPlaylist = Playlist.videos.some(
        (vid)=>vid.equals(VideoId)
    )
    if(VideoExistPlaylist){
        throw new ApiError(400,"Video Already exist.")
    }
    Playlist.videos.push(VideoId)
    await Playlist.save()
    return res
    .status(200)
    .json(200,Playlist,"Video added successfully")
})

const removeVideo = asyncHandler(async(req,res)=>{
    const {playlistId, videoId} = req.params.id
    if(!playlistId || !videoId){
        throw new ApiError(400,"required field is empty.")
    }
    const Playlist = await playlist.findById(playlistId)
    if(!Playlist){
        throw new ApiError(400,"Playlist is not exist.")
    }
    const Video = await Playlist.find({
        videos:videoId
    })
    if(!Video){
        throw new ApiError(400,"Video is not found.")
    }
    await Video.deleteOne()
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video removed Successfully.")
    )
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const playlistId = req.params.id
    if(!playlistId){
        throw new ApiError(400,"Playlist Id required.")
    }
    const Playlist = await playlist.findById(playlistId)
    if(!Playlist){
        throw new ApiError(400,"Playlist is not found.")
    }
    const checkowner = req.User.id == Playlist.owner.id
    if(!checkowner){
        throw new ApiError(400,"Can't delete playlist")
    }
    await Playlist.deleteOne()
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist deleted Successfully.")
    )
})

export {createPlaylist,updatePlaylist,getUserPlaylist,addVideo,deletePlaylist,removeVideo}
