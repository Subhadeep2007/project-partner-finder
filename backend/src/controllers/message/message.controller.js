import {
    getProjectMessages,
    getUnreadCount,
    deleteMessageForMe,
    deleteMessageForEveryone,
    addEncryptedKeyForUser,
    editMessage
} from "../../services/message/message.service.js";


const getProjectMessagesController = async(
    req,
    res,
    next
) => {
    try {

        const result =
            await getProjectMessages({
                projectId: req.params.projectId,
                userId: req.user.userId,
                page: req.query.page,
                limit: req.query.limit
            });


        return res.status(200).json({
            success: true,
            count: result.messages.length,
            data: result.messages,
            pagination: result.pagination
        });

    } catch (error) {

        next(error);

    }
};


const getUnreadCountController = async(
    req,
    res,
    next
) => {
    try {

        const result =
            await getUnreadCount({
                projectId: req.params.projectId,
                userId: req.user.userId
            });


        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);

    }
};


const deleteMessageForMeController = async(
    req,
    res,
    next
) => {
    try {

        const result =
            await deleteMessageForMe({
                messageId: req.params.messageId,
                userId: req.user.userId
            });


        return res.status(200).json({
            success: true,
            message: "Message deleted for you",
            data: result
        });

    } catch (error) {

        next(error);

    }
};


const deleteMessageForEveryoneController = async(
    req,
    res,
    next
) => {
    try {

        const result =
            await deleteMessageForEveryone({
                messageId: req.params.messageId,
                userId: req.user.userId
            });


        return res.status(200).json({
            success: true,
            message: "Message deleted for everyone",
            data: result
        });

    } catch (error) {

        next(error);

    }
};

const addEncryptedKeyForUserController =
    async(
        req,
        res,
        next
    ) => {

        try {

            const result =
                await addEncryptedKeyForUser({

                    messageId: req.params.messageId,

                    projectId: req.params.projectId,

                    requesterId: req.user.userId,

                    targetUserId: req.body.targetUserId,

                    encryptedKey: req.body.encryptedKey,

                    keyVersion: req.body.keyVersion

                });


            return res.status(200).json({

                success: true,

                message: "Encrypted message key added successfully",

                data: result

            });

        } catch (error) {

            next(error);

        }

    };

const editMessageController = async(
    req,
    res,
    next
) => {

    try {

        const result =
            await editMessage({

                messageId: req.params.messageId,

                userId: req.user.userId,

                encryptedContent: req.body.encryptedContent,

                iv: req.body.iv,

                encryptedKeys: req.body.encryptedKeys

            });


        return res.status(200).json({

            success: true,

            message: "Message edited successfully",

            data: result

        });

    } catch (error) {

        next(error);

    }

};
export {
    getProjectMessagesController,
    getUnreadCountController,
    deleteMessageForMeController,
    deleteMessageForEveryoneController,
    addEncryptedKeyForUserController,
    editMessageController
};