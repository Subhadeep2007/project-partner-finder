import {
    getProjectMessages,
    getUnreadCount
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
        const result = await getUnreadCount({
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


export {
    getProjectMessagesController,
    getUnreadCountController
};