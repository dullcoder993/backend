import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {user} from "../models/user.model.js"

dotenv.config()


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const User = await user.findById(decodeToken?._id).select("-password -refreshToken")
    
        if(!User){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.User = User;
        next()
    } catch (error) {
        throw new ApiError(400,error?.message || "Invalid access token")
    }
})

export default verifyJWT;