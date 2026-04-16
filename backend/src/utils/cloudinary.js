import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //file system(r,wr,rm,op,cl)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, publicId = null) => {
  try {
    if (!localFilePath) return null;

    // Set up upload options
    const options = {
      resource_type: "auto", // Automatically detect if it's a PDF or Image
    };

    // If we passed a custom name (like REP-12345_1713264000), apply it here
    if (publicId) {
      options.public_id = publicId;
    }

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, options);
    
    // File uploaded successfully, remove the local temp file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return response;

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    
    // Cleanup: Remove the local file even if the upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return null;
  }
};

const deleteFromCloudinary = async (cloudinaryUrl, resourceType = null) => {
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
