import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { tweet } from "../models/tweet.model.js";


const addTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body
    console.log(content)
    if(!content){
        throw new ApiError(400,"required field is empty.")
    }
    const Tweet = await tweet.create(
        {
            content,
            owner : req.User.id
        }
    )
    if(!Tweet){
        throw new ApiError(400,"Somthing went wrong.")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,Tweet,"Tweet is created.")
    )
})

const updateTweet = asyncHandler(async(req,res)=>{
    const tweetId = req.params.id
    const {content} = req.body
    if(!tweetId || !content){
        throw new ApiError(400,"Required field is empty.")
    }

    const tweetOwner = req.User.id
    const Tweet = await tweet.findById(tweetId)
console.log("hi")
    if(Tweet.owner === tweetOwner){
        throw new ApiError(400,"Cannot other people tweets.")
    }
    Tweet.content = content
    await Tweet.save()
    console.log("hi")
    return res
    .status(200)
    .json (
        new ApiResponse(200,Tweet,"Tweet updated Successfully.")
    )
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const tweetId = req.params.id
    const TweetOwner = req.User.id
    if(!tweetId){
        throw new ApiError(400,"Required field is empty.")
    }
    const Tweet = await tweet.findById(tweetId)
    if(!Tweet){
        throw new ApiError(400,"Tweet is not found.")
    }
    if(Tweet.owner === TweetOwner){
        throw new ApiError(400,"Can not delete other people's tweet.")
    }
    await Tweet.deleteOne();
    return res
    .status(200)
    .json(
        new ApiResponse(200,"Tweet deleted Successfully.")
    )
})

const getUserTweet = asyncHandler(async(req,res)=>{
    const Tweet = await tweet.find({owner: req.User.id})
    return res
    .status(200)
    .json(
        new ApiResponse(200,Tweet,"User's Tweet fetched successfully")
    )
})
export {addTweet,updateTweet,deleteTweet,getUserTweet}
