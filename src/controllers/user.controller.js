import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {user,isPasswordCorrect} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import fs from "fs"
import path from 'path'

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
        console.log(username);
        console.log(fullName);
        console.log(email);
        console.log(password);
    }

    //Step 3 

    const existingUser =await user.findOne({
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

    const {email,username,password} =req.body

    if(!username && !email){
        throw new ApiError(400,'Username or Password required')
    }

    const User =await user.findOne({
        $or: [{username},{email}]
    })
    if(!User){
        throw new ApiError(404,'Usern does not exist')
    }
    if(!password){
        throw new ApiError(400,'Password is required')
    }
    const passwordValid =await isPasswordCorrect(password)

    if(!passwordValid){
        throw new ApiError(401,'Password is incorrect')
    }
    const {accessToken,refreshToken}=await generateToken(User._id)

    const loggedUser = user.findById(User._id).select("-password -refreshToken")

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

export {registerUser,
    loginUser,
    loguotUser
}