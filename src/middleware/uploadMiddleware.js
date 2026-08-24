import multer from "multer";

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!imageMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only JPG, PNG, WEBP, and GIF images are allowed"));
    }

    callback(null, true);
  },
});

export default upload;
