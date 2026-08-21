import { Readable } from "stream";

import cloudinary from "../../config/cloudinary.js";

const uploadChatFile = async({
    fileBuffer,
    mimeType
}) => {
    return new Promise((resolve, reject) => {
        const uploadStream =
            cloudinary.uploader.upload_stream({
                    resource_type: "auto",
                    folder: "project-chat",

                    // Helpful metadata
                    format: undefined
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve({
                        fileUrl: result.secure_url,
                        publicId: result.public_id,
                        resourceType: result.resource_type
                    });
                }
            );

        const bufferStream =
            new Readable();

        bufferStream.push(fileBuffer);
        bufferStream.push(null);

        bufferStream.pipe(uploadStream);
    });
};

export {
    uploadChatFile
};