import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const playlistSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        discription:{
            type: String,
            required: true
        },
        videos:[{
            type : mongoose.Schema.Types.ObjectId,
            ref:"videos"
        }],
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    },{
    timestamps:true
    })

playlistSchema.plugin(mongooseAggregatePaginate)

export const playlist = mongoose.model("playlist", playlistSchema)