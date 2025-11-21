import {v2} from "cloudinary";
import fs from 'fs'//file system
import dotenv from 'dotenv'

dotenv.config()

const cloud_keys = v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:'286898911612598',
    api_secret :'E85Lkzfq6hpogwi_v73iRSFAK_g'
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) {
            console.log('here')
            return null
        }
        //upload the file
        const response = await v2.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has been uploaded successfully
        console.log('File is uploaded on cloudinary', response.url);
        fs.unlinkSync(localFilePath)
        return response;
    }
    catch (error) {
        // remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        console.log('not here')
        console.log(cloud_keys)
        return null;
    }
}

export {uploadOnCloudinary}