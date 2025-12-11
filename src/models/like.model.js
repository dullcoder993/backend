import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'videos'
    },
    comment:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'comments'
    },
    likeby:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    tweet:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'tweets'
    }
},{timestamps: true})

export const like = mongoose.model('like',likeSchema)