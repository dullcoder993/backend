import dotenv from "dotenv"


dotenv.config()
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`mongodb+srv://prk:prk123@cluster0.bwam6lg.mongodb.net/?appName=Cluster0/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        console.log(DB_NAME)
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}



connectDB()






/* This is the first approch form communicating with DATABASE.
import express from "express"
const app = express()

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Can't able to communicate with DataBase.",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR : ",error)
        throw err
    }
})()
    */