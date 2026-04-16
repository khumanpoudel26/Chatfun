import cloudinary from "../configs/cloudinary";
import apiError from "./apiError";
import asyncHandler from "./asyncHandler";

export const uploadCloud =
  async (buffer: Buffer, folder: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(new apiError(500, "Failed to upload to Cloudinary"));
          }
          resolve(result?.url); // result contains secure_url, public_id, etc.
        }
      );

      // Write the buffer to the stream
      uploadStream.end(buffer);

    });
  };