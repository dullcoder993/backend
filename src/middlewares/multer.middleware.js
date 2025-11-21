import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure folder exists


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        const safeName = file.originalname.replace(/\s+/g, "_");
        cb(null, uniqueSuffix + "-" + safeName);
    },
});

export const upload = multer({ storage });
