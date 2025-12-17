import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {user} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import fs from "fs"
import path from 'path'
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"
import mongoose from 'mongoose'

dotenv.config()


const generateToken = async(userId)=>
{
    try {
        const User = await user.findById(userId)
        const accessToken = User.generateAccessToken()
        const refreshToken = User.generateRefreshToken()
        User.refreshToken = refreshToken
        await  User.save({validateBeforeSave: false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,'Internal error')
    }
}

const registerUser = asyncHandler( async(req,res,next)=>{
    
    //1. get user details from frontend
    //2. validation - not empty
    //3. check if user already exist : username, email
    //4. check for images, check for avatar
    //5. upload them to cloudinary, avatar
    //6. create user object - create entry in db
    //7. remove password and refresh token from response
    //8. check for user creation 
    //9. return response


    //Step 1

    const {fullName, email, username, password} = req.body

    //Step 2

    if(!username||!fullName||!email||!password){
        throw new ApiError(400,'The required field is empty.' )
    }else{
        // This is only for debugging.
        console.log(username);
        console.log(fullName);
        console.log(email);
        console.log(password);
    }

    //Step 3 

    const existingUser =await user.findOne({
        // Used email or username because this are unique as written in user.model
        $or: [{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409, "User with same username or email already exist ")
    }
    //Step 4

    let avatarLocalPath = req.files?.avatar[0]?.path;
    let coverLocalPath = req.files?.coverImage[0]?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }else{
        console.log('file upload to multer.')
    }
    if(!coverLocalPath){
        throw new ApiError(400,"Cover file is required")
    }
    //Step 5
    avatarLocalPath = path.resolve(avatarLocalPath);
    coverLocalPath = path.resolve(coverLocalPath)
    const fixedAvatarPath = avatarLocalPath.replace(/\\/g, "/")
    const avatar = await uploadOnCloudinary(fixedAvatarPath)
    console.log(fixedAvatarPath)
    const fixedCoverPath = coverLocalPath?.replace(/\\/g, "/")
    const cover = await uploadOnCloudinary(fixedCoverPath)
    if(!avatar){
        throw new ApiError(400,'Avatar file is required.Retry.')}
    //Step 6
    const User = await user.create({
        fullName,
        avatar: avatar.url,
        cover: cover?.url||'',
        email,
        username,
        password
    })
    //Step 7
    const createUser = await user.findById(User._id).select(
        '-password -refreshToken')
    //Step 8
    if(!createUser){
        throw new ApiError(500,'Something went wrong when creating user try again.')
    }
    //Step 9
    return res.status(201).json(
        new ApiResponse(200,createUser,'User created Successfully')
    )
})
const loginUser = asyncHandler(async(req,res,next)=>{
    // 1.Taking email id or username from user
    // 2.Checking does email or username exist(if not throw error)
    // 3.Taking password from user
    // 4.Checking password is correct or not (if not throw error)
    // 5.Give Access and Refresh Token
    // 6.Send cookies(response)

    const { email, username, password} =req.body

    if(!username && !email){
        throw new ApiError(400,'Username or Email required')
    }

    const User =await user.findOne({
        $or: [{username},{email}]
    })
    if(!User){
        throw new ApiError(404,'User does not exist')
    }
    if(!password){
        throw new ApiError(400,'Password is required')
    }
    
    const passwordValid = await User.isPasswordCorrect(password)
    
    if(!passwordValid){
        throw new ApiError(401,'Password is incorrect')
    }else{
        console.log("Password is correct")
    }
    const {accessToken,refreshToken}=await generateToken(User._id)

    const loggedUser = await user.findById(User._id).select("-password -refreshToken")

    // cookies

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                User: loggedUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const loguotUser = asyncHandler(async(req, res)=>{
    await user.findByIdAndDelete(
        req.User._id,
        {
            $set:
            {refreshToken: undefined}
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User logout."))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(400,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const User = await  user.findById(decodedToken?._id)
        if(!User){
            throw new ApiError(400,"Invalid refresh token")
        }
        if(incomingRefreshToken !== User?.refreshToken){
            throw new ApiError(400,"Wrong Token")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken,newRefreshToken} = await generateToken(User._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken : newRefreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh Token")
    }
})
// Extra controller for practice...
const changeUserPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword,confirmPassword} = req.body
    if(!oldPassword){
        throw new ApiError(400,"Required old password.")
    }
    const User = await user.findById(req.User?._id)
    const checkPassword = await User.isPasswordCorrect(oldPassword)
    if(!checkPassword){
        throw new ApiError(400,"Wrong password")
    }
    if(!newPassword || !confirmPassword){
        throw new ApiError(400,"Required field is empty")
    }
    if(newPassword !== confirmPassword){
        throw new ApiError(400,"Confirm password should be same as new password.")
    }
    if(user.password === newPassword){
        throw new ApiError(400,"New password is same as old password.")
    }
    User.password = newPassword;
    await User.save({validateBeforeSave: false})
    
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully")) 
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.User,"Current user fetched successfully")
    )
})

const updateDetail = asyncHandler(async(req,res)=>{
    const {email,fullName} = req.body
    if(!email && !fullName){
        throw new ApiError(400,"required field is empty")
    }
    const User = await user.findByIdAndUpdate(
        req.User?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,User,"Account details updated successfully."))

})

const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Internal error while uploading to cloudinary")
    }
    const User = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json (new ApiResponse(200,User,"Cover image updated."))
})

const updateCover = asyncHandler(async(req,res)=>{
    const coverLocalPath = req.file?.path
    if(!coverLocalPath){
        throw new ApiError(400,"Cover file required")
    }
    const cover = await uploadOnCloudinary(avatarLocalPath)
    if(!cover.url){
        throw new ApiError(400,"Internal error while uploading to cloudinary")
    }
    const User = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: cover.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,User,"Cover image updated."))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }
    const channel = await user.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribesCount :{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribe:{
                    $cond:{
                        if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false 
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                subscribesCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribe:1,
                avatar: 1 ,
                coverImage: 1,
                owner:1
            }
        }
    ])
    console.log(channel)
    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully. ")
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const User = await user.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.User._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    
                                        $project:{
                                            username:1,
                                            fullName:1,
                                            avatar:1
                                        }
                                    
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            User[0].watchHistory,
            "Watch Histort Fetched Successfully."
        )
    )
})

export {registerUser,
    loginUser,
    loguotUser,
    refreshAccessToken,
    changeUserPassword,
    getCurrentUser,
    updateDetail,
    updateAvatar,
    updateCover,
    getUserChannelProfile,
    getWatchHistory
}