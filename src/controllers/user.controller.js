import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {user} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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

    const existingUser = user.findOne({
        $or: [{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409, "User with same username or email already exist ")
    }
    //Step 4

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    //Step 5

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const cover = await uploadOnCloudinary(coverLocalPath);

    if(!avatar){
        throw new ApiError(400,'Avatar file is required.Retry.')
    }
    //Step 6

    const User = await user.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url||'',
        email,
        username,
        password
    })
    //Step 7

    const createUser = await user.findById(user._id).select(
        '-password -refreshToken'
    )
    //Step 8
    if(!createUser){
        throw new ApiError(500,'Something went wrong when creating user try again.')
    }
    //Step 9

    return res.status(201).json(
        new ApiResponse(200,createUser,'User created Successfully')
    )
})

export {registerUser}