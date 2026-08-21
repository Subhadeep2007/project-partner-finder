import Project from "../../models/project.js";
import Message from "../../models/message.js";
import {
    getIO
} from "../../socket/socket.js";
import {
    uploadChatFile
} from "../../services/message/chatUpload.service.js";

const uploadChatFileController = async(
    req,
    res,
    next
) => {
    try {
        const { projectId } = req.params;

        const userId = req.user.userId;

        // 1. Check file
        if (!req.file) {
            throw new Error("File is required");
        }

        // 2. Find project
        const project =
            await Project.findById(projectId);

        if (!project) {
            throw new Error("Project not found");
        }

        // 3. Check owner
        const isOwner =
            project.owner.toString() === userId;

        // 4. Check member
        const isMember =
            project.members.some(
                (memberId) =>
                memberId.toString() === userId
            );

        // 5. Authorization
        if (!isOwner && !isMember) {
            throw new Error(
                "You are not authorized to upload files in this project"
            );
        }

        // 6. Upload to Cloudinary
        const uploadedFile =
            await uploadChatFile({
                fileBuffer: req.file.buffer,
                mimeType: req.file.mimetype
            });

        // 7. Detect message type
        const messageType =
            req.file.mimetype.startsWith("image/") ?
            "image" :
            "file";

        // 8. Create message
        const message = await Message.create({
            project: projectId,
            sender: userId,
            messageType,
            fileUrl: uploadedFile.fileUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });
        const io = getIO();

        io.to(
            `project:${projectId}`
        ).emit(
            "receive_message",
            message
        );
        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            data: message
        });

    } catch (error) {
        next(error);
    }
};

export {
    uploadChatFileController
};