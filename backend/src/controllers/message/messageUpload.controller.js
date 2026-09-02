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

        const {
            projectId
        } = req.params;

        const userId =
            req.user.userId;


        if (!req.file) {

            throw new Error(
                "File is required"
            );

        }


        const project =
            await Project.findById(
                projectId
            );


        if (!project) {

            throw new Error(
                "Project not found"
            );

        }


        const isOwner =
            project.owner.toString() ===
            userId;


        const isMember =
            project.members.some(
                (memberId) =>
                memberId.toString() ===
                userId
            );


        if (!isOwner && !isMember) {

            throw new Error(
                "You are not authorized to upload files in this project"
            );

        }


        const uploadedFile =
            await uploadChatFile({

                fileBuffer: req.file.buffer,

                mimeType: req.file.mimetype

            });


        const messageType =
            req.file.mimetype.startsWith(
                "image/"
            ) ?
            "image" :
            "file";


        const message =
            await Message.create({

                project: projectId,

                sender: userId,

                messageType,

                fileUrl: uploadedFile.fileUrl,

                filePublicId: uploadedFile.publicId,

                fileResourceType: uploadedFile.resourceType,

                fileName: req.file.originalname,

                fileSize: req.file.size,

                mimeType: req.file.mimetype

            });


        await message.populate(
            "sender",
            "name profileImage"
        );


        const io =
            getIO();
        console.log(
            "FILE SOCKET BROADCAST:",
            message._id.toString(),
            message.project.toString(),
            message.messageType,
            message.fileUrl
        );

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