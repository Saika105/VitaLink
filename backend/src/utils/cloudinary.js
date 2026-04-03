import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //file system(r,wr,rm,op,cl)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", //detect automatic file type
    });
    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return null;

    const urlParts = cloudinaryUrl.split("/");
    const fileNameWithExtension = urlParts.pop();
    const publicId = fileNameWithExtension.split(".")[0];

    const isPdf = cloudinaryUrl.toLowerCase().endsWith(".pdf");
    const resType = isPdf ? "raw" : "image";

    console.log(`Attempting to delete ${resType}: ${publicId}`);

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resType,
    });

    console.log("Cloudinary Delete Response:", response);
    return response;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
