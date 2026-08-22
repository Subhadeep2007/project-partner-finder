import {
    sendJoinRequest,
    getIncomingJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    leaveProject,
    removeProjectMember
} from "../../services/joinRequest/joinRequest.service.js";

const sendJoinRequestController = async(req, res, next) => {
    try {
        const joinRequest = await sendJoinRequest(
            req.params.projectId,
            req.user.userId
        );

        return res.status(201).json({
            success: true,
            message: "Join request sent successfully",
            data: joinRequest
        });
    } catch (error) {
        next(error);
    }
};

const getIncomingJoinRequestsController = async(
    req,
    res,
    next
) => {
    try {
        const requests = await getIncomingJoinRequests(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};
const acceptJoinRequestController = async(
    req,
    res,
    next
) => {
    try {
        const result = await acceptJoinRequest(
            req.params.requestId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Join request accepted successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const rejectJoinRequestController = async(
    req,
    res,
    next
) => {
    try {
        const result = await rejectJoinRequest(
            req.params.requestId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Join request rejected successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const leaveProjectController = async(
    req,
    res,
    next
) => {
    try {
        const result = await leaveProject(
            req.params.projectId,
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "You have left the project successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const removeProjectMemberController = async(
    req,
    res,
    next
) => {
    try {
        const result = await removeProjectMember(
            req.params.projectId,
            req.user.userId,
            req.params.memberId
        );

        return res.status(200).json({
            success: true,
            message: "Project member removed successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};
export {
    sendJoinRequestController,
    getIncomingJoinRequestsController,
    acceptJoinRequestController,
    rejectJoinRequestController,
    leaveProjectController,
    removeProjectMemberController
};