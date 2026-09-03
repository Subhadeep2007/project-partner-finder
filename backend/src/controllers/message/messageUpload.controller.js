// import Project from "../../models/project.js";
// import Message from "../../models/message.js";

// import {
//     getIO
// } from "../../socket/socket.js";

// import {
//     uploadChatFile
// } from "../../services/message/chatUpload.service.js";


// const uploadChatFileController = async(
//     req,
//     res,
//     next
// ) => {

//     try {

//         const {
//             projectId
//         } = req.params;

//         const userId =
//             req.user.userId;


//         if (!req.file) {

//             throw new Error(
//                 "File is required"
//             );

//         }


//         const project =
//             await Project.findById(
//                 projectId
//             );


//         if (!project) {

//             throw new Error(
//                 "Project not found"
//             );

//         }


//         const isOwner =
//             project.owner.toString() ===
//             userId;


//         const isMember =
//             project.members.some(
//                 (memberId) =>
//                 memberId.toString() ===
//                 userId
//             );


//         if (!isOwner && !isMember) {

//             throw new Error(
//                 "You are not authorized to upload files in this project"
//             );

//         }


//         const uploadedFile =
//             await uploadChatFile({

//                 fileBuffer: req.file.buffer,

//                 mimeType: req.file.mimetype

//             });


//         const messageType =
//             req.file.mimetype.startsWith(
//                 "image/"
//             ) ?
//             "image" :
//             "file";


//         const message =
//             await Message.create({

//                 project: projectId,

//                 sender: userId,

//                 messageType,

//                 fileUrl: uploadedFile.fileUrl,

//                 filePublicId: uploadedFile.publicId,

//                 fileResourceType: uploadedFile.resourceType,

//                 fileName: req.file.originalname,

//                 fileSize: req.file.size,

//                 mimeType: req.file.mimetype

//             });


//         await message.populate(
//             "sender",
//             "name profileImage"
//         );


//         const io =
//             getIO();
//         console.log(
//             "FILE SOCKET BROADCAST:",
//             message._id.toString(),
//             message.project.toString(),
//             message.messageType,
//             message.fileUrl
//         );

//         io.to(
//             `project:${projectId}`
//         ).emit(
//             "receive_message",
//             message
//         );


//         return res.status(201).json({

//             success: true,

//             message: "File uploaded successfully",

//             data: message

//         });

//     } catch (error) {

//         next(error);

//     }

// };


// export {
//     uploadChatFileController
// };





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
    console.log(
        "🔥🔥 FILE UPLOAD CONTROLLER HIT 🔥🔥"
    );
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
        const messageData = {
            ...message.toObject(),
            _id: message._id.toString(),
            project: projectId.toString()
        };

        const io = getIO();

        const roomName = `project:${projectId}`;
        const room = io.sockets.adapter.rooms.get(roomName);

        console.log(
            "FILE SOCKET ROOM CHECK:",
            roomName,
            "SOCKET COUNT:",
            room ? room.size : 0
        );

        console.log(
            "FILE SOCKET SOCKET IDS:",
            room ? [...room] : []
        );

        io.to(roomName).emit(
            "receive_message",
            messageData
        );

        // ==========================================
        // PERSONAL USER ROOM BROADCAST
        // ==========================================

        const participantIds = [
            project.owner.toString(),
            ...project.members.map(
                (memberId) =>
                memberId.toString()
            )
        ];


        const uniqueParticipantIds = [
            ...new Set(
                participantIds
            )
        ];

        uniqueParticipantIds.forEach(
            (participantId) => {

                const personalRoom =
                    `user:${participantId}`;

                const personalSockets =
                    io.sockets.adapter.rooms.get(
                        personalRoom
                    );

                console.log(
                    "FILE PERSONAL ROOM CHECK:",
                    personalRoom,
                    "SOCKET COUNT:",
                    personalSockets ?
                    personalSockets.size :
                    0
                );

                io.to(
                    personalRoom
                ).emit(
                    "receive_message",
                    messageData
                );

            }
        );


        console.log(
            "🔥 FILE SOCKET BROADCAST COMPLETE:",
            message._id.toString(),
            "PARTICIPANTS:",
            uniqueParticipantIds
        );


        return res.status(201).json({

            success: true,

            message: "File uploaded successfully",

            data: messageData

        });

    } catch (error) {

        next(error);

    }

};


export {
    uploadChatFileController
};