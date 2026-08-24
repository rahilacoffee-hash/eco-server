import cloudinary from "../config/cloudinary.js";

const requiredConfig = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

export const uploadImage = (file, folder) => {
  if (!file) return Promise.resolve(null);

  if (requiredConfig.some((key) => !process.env[key])) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });
};
