import multer from "multer";

const storage = multer.memoryStorage();

const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",

    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Text
    "text/plain"
];

const chatUpload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Unsupported file type"
                )
            );
        }

        cb(null, true);
    }
});

export default chatUpload;