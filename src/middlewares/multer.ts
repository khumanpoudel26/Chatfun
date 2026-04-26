import multer from "multer";
import apiError from "../utils/apiError";

const storage = multer.memoryStorage();

export const uploadProfile = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024  // 5MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        }
        else {
            cb(new apiError(400, "Only .jpg, .jpeg and .png format allowed!"));
        }
    }
});


export const uploadFile = multer({
    storage,
    limits: {
        fileSize: 200 * 1024 * 1024  // 200MB
    }
});