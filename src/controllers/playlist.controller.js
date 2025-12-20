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
    const Playlist = await playlist.find({owner : req.User.id})
    if(!Playlist){
        throw new ApiError(400,"Playlist is not found.")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,Playlist,"User Playlist is fetched.")
    )
})

const getPlaylist = asyncHandler(async(req,res)=>{
    const playlistId = req.params.id
    if(!playlistId){
        throw new ApiError(400,"Playlist Id required.")
    }
    const Playlist = await playlist.findById(playlistId)
    if(!Playlist){
        throw new ApiError(400,"playist is not found.")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,Playlist,"Playlist data fetched Successfully.")
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

export {createPlaylist,updatePlaylist,getUserPlaylist,getPlaylist,addVideo}
