import Project from "../../models/project.js";
import JoinRequest from "../../models/joinRequest.js";
import User from "../../models/User.js";
import sendEmail from "../../utils/sendEmail.js";

import {
    createNotification
} from "../../services/notification/notification.service.js";

import {
    getIO
} from "../../socket/socket.js";


// ==========================================
// SEND / RE-JOIN REQUEST
// ==========================================

const sendJoinRequest = async(
    projectId,
    userId
) => {

    const project =
        await Project.findById(
            projectId
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    // OWNER CANNOT JOIN OWN PROJECT

    if (
        project.owner.toString() ===
        userId
    ) {

        throw new Error(
            "Project owner cannot send a join request"
        );

    }


    // PROJECT MUST BE OPEN

    if (
        project.status !==
        "open"
    ) {

        throw new Error(
            "This project is not open for join requests"
        );

    }


    // TEAM FULL

    if (
        project.currentMembers >=
        project.teamSize
    ) {

        throw new Error(
            "Project team is already full"
        );

    }


    // ALREADY MEMBER

    const isAlreadyMember =
        project.members.some(
            (memberId) =>

            memberId.toString() ===
            userId

        );


    if (isAlreadyMember) {

        throw new Error(
            "You are already a member of this project"
        );

    }


    // FIND EXISTING REQUEST

    const existingRequest =
        await JoinRequest.findOne({

            project: projectId,

            user: userId

        });


    let joinRequest;

    let isRejoin =
        false;


    // ==========================================
    // EXISTING REQUEST
    // ==========================================

    if (existingRequest) {


        // PENDING

        if (
            existingRequest.status ===
            "pending"
        ) {

            throw new Error(
                "You already have a pending join request for this project"
            );

        }


        // ACCEPTED

        if (
            existingRequest.status ===
            "accepted"
        ) {

            throw new Error(
                "You are already an accepted member of this project"
            );

        }


        // REJECTED / REMOVED / LEFT
        // REUSE SAME REQUEST

        existingRequest.status =
            "pending";


        existingRequest.removedAt =
            null;


        existingRequest.removedBy =
            null;


        existingRequest.leftAt =
            null;


        existingRequest.rejoinCount =
            Number(
                existingRequest.rejoinCount ||
                0
            ) + 1;


        await existingRequest.save();


        joinRequest =
            existingRequest;


        isRejoin =
            true;


    } else {


        // BRAND NEW REQUEST

        joinRequest =
            await JoinRequest.create({

                project: projectId,

                user: userId,

                status: "pending"

            });

    }


    // ==========================================
    // GET USER
    // ==========================================

    const user =
        await User.findById(
            userId
        );


    let userName =
        "A user";


    if (
        user &&
        user.name
    ) {

        userName =
            user.name;

    }


    // ==========================================
    // OWNER NOTIFICATION
    // ==========================================

    let notificationTitle =
        "New Join Request";


    let notificationMessage =
        `${userName} wants to join your project "${project.title}"`;


    if (isRejoin) {

        notificationTitle =
            "Re-Join Request";


        notificationMessage =
            `${userName} wants to re-join your project "${project.title}"`;

    }


    await createNotification({

        recipient: project.owner,

        sender: userId,

        type: "join_request",

        title: notificationTitle,

        message: notificationMessage,

        project: project._id

    });


    // ==========================================
    // OWNER EMAIL
    // ==========================================

    const owner =
        await User.findById(
            project.owner
        );


    if (
        owner &&
        owner.email &&
        user
    ) {

        let emailSubject =
            `New Join Request - ${project.title}`;


        let actionText =
            " wants to join ";


        if (isRejoin) {

            emailSubject =
                `Re-Join Request - ${project.title}`;


            actionText =
                " wants to re-join ";

        }


        await sendEmail({

            to: owner.email,

            subject: emailSubject,

            html: `
                <h2>
                    Hello ${owner.name}
                </h2>

                <p>
                    <strong>${user.name}</strong>
                    ${actionText}
                    your project
                    <strong>${project.title}</strong>.
                </p>

                <p>
                    Open Project Partner Finder
                    to review the request.
                </p>

                <p>
                    Project Partner Finder 🚀
                </p>
            `

        });

    }


    return joinRequest;

};


// ==========================================
// GET INCOMING JOIN REQUESTS
// ==========================================

const getIncomingJoinRequests = async(
    userId
) => {

    const projects =
        await Project.find({

            owner: userId

        }).select(
            "_id"
        );


    const projectIds =
        projects.map(
            (project) =>
            project._id
        );


    const requests =
        await JoinRequest.find({

            project: {
                $in: projectIds
            },

            status: "pending"

        })

    .populate(
        "project",
        "title owner"
    )

    .populate(
        "user",
        "name email profileImage skills"
    )

    .sort({
        createdAt:
            -1
    });


    return requests;

};


// ==========================================
// ACCEPT JOIN REQUEST
// ==========================================

const acceptJoinRequest = async(
    requestId,
    ownerId
) => {

    const joinRequest =
        await JoinRequest.findById(
            requestId
        );


    if (!joinRequest) {

        throw new Error(
            "Join request not found"
        );

    }


    if (
        joinRequest.status !==
        "pending"
    ) {

        throw new Error(
            `This join request has already been ${joinRequest.status}`
        );

    }


    const project =
        await Project.findById(
            joinRequest.project
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    // ONLY OWNER

    if (
        project.owner.toString() !==
        ownerId
    ) {

        throw new Error(
            "You are not authorized to accept this join request"
        );

    }


    // TEAM FULL

    if (
        project.currentMembers >=
        project.teamSize
    ) {

        throw new Error(
            "Project team is already full"
        );

    }


    // ALREADY MEMBER

    const isAlreadyMember =
        project.members.some(
            (memberId) =>

            memberId.toString() ===
            joinRequest.user.toString()

        );


    if (isAlreadyMember) {

        throw new Error(
            "User is already a member of this project"
        );

    }


    // ADD MEMBER

    project.members.push(
        joinRequest.user
    );


    // INCREASE COUNT

    project.currentMembers +=
        1;


    // CLOSE IF FULL

    if (
        project.currentMembers >=
        project.teamSize
    ) {

        project.status =
            "closed";

    }


    await project.save();


    // UPDATE REQUEST

    joinRequest.status =
        "accepted";


    joinRequest.removedAt =
        null;


    joinRequest.removedBy =
        null;


    joinRequest.leftAt =
        null;


    await joinRequest.save();


    // NOTIFICATION

    await createNotification({

        recipient: joinRequest.user,

        sender: ownerId,

        type: "join_accepted",

        title: "Join Request Accepted",

        message: `Your request to join "${project.title}" has been accepted.`,

        project: project._id

    });


    // REAL TIME

    try {

        const io =
            getIO();


        io.to(
            `project:${project._id.toString()}`
        ).emit(

            "member_joined",

            {

                projectId: project._id,

                memberId: joinRequest.user,

                currentMembers: project.currentMembers,

                teamSize: project.teamSize

            }

        );


    } catch (error) {

        console.error(
            "Real-time member joined event failed:",
            error.message
        );

    }


    // USER

    const user =
        await User.findById(
            joinRequest.user
        );


    // ACCEPTANCE EMAIL

    if (
        user &&
        user.email
    ) {

        await sendEmail({

            to: user.email,

            subject: `Join Request Accepted - ${project.title}`,

            html: `
                <h2>
                    Congratulations ${user.name} 🎉
                </h2>

                <p>
                    Your request to join
                    <strong>${project.title}</strong>
                    has been accepted.
                </p>

                <p>
                    You are now officially a member
                    of the team.
                </p>

                <p>
                    Happy building! 🚀
                </p>
            `

        });

    }


    return {

        requestId: joinRequest._id,

        status: joinRequest.status,

        projectId: project._id

    };

};


// ==========================================
// REJECT JOIN REQUEST
// ==========================================

const rejectJoinRequest = async(
    requestId,
    ownerId
) => {

    const joinRequest =
        await JoinRequest.findById(
            requestId
        );


    if (!joinRequest) {

        throw new Error(
            "Join request not found"
        );

    }


    if (
        joinRequest.status !==
        "pending"
    ) {

        throw new Error(
            `This join request has already been ${joinRequest.status}`
        );

    }


    const project =
        await Project.findById(
            joinRequest.project
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    // ONLY OWNER

    if (
        project.owner.toString() !==
        ownerId
    ) {

        throw new Error(
            "You are not authorized to reject this join request"
        );

    }


    // REJECT

    joinRequest.status =
        "rejected";


    await joinRequest.save();


    // NOTIFICATION

    await createNotification({

        recipient: joinRequest.user,

        sender: ownerId,

        type: "join_rejected",

        title: "Join Request Rejected",

        message: `Your request to join "${project.title}" was not accepted.`,

        project: project._id

    });


    // USER

    const user =
        await User.findById(
            joinRequest.user
        );


    // EMAIL

    if (
        user &&
        user.email
    ) {

        await sendEmail({

            to: user.email,

            subject: `Join Request Update - ${project.title}`,

            html: `
                <h2>
                    Hello ${user.name}
                </h2>

                <p>
                    Your request to join
                    <strong>${project.title}</strong>
                    was not accepted at this time.
                </p>

                <p>
                    You can explore other projects
                    on Project Partner Finder.
                </p>
            `

        });

    }


    return {

        requestId: joinRequest._id,

        status: joinRequest.status

    };

};


// ==========================================
// MEMBER LEAVES PROJECT
// ==========================================

const leaveProject = async(
    projectId,
    userId
) => {

    const project =
        await Project.findById(
            projectId
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    // OWNER CANNOT LEAVE

    if (
        project.owner.toString() ===
        userId
    ) {

        throw new Error(
            "Project owner cannot leave the project"
        );

    }


    // MEMBER CHECK

    const isMember =
        project.members.some(
            (memberId) =>

            memberId.toString() ===
            userId

        );


    if (!isMember) {

        throw new Error(
            "You are not a member of this project"
        );

    }


    // REMOVE MEMBER

    project.members =
        project.members.filter(
            (memberId) =>

            memberId.toString() !==
            userId

        );


    // DECREASE COUNT

    project.currentMembers =
        Math.max(
            project.currentMembers - 1,
            1
        );


    // REOPEN

    if (
        project.status ===
        "closed" &&

        project.currentMembers <
        project.teamSize

    ) {

        project.status =
            "open";

    }


    await project.save();


    // UPDATE REQUEST LIFECYCLE

    const request =
        await JoinRequest.findOne({

            project: projectId,

            user: userId

        });


    if (request) {

        request.status =
            "left";


        request.leftAt =
            new Date();


        request.removedAt =
            null;


        request.removedBy =
            null;


        await request.save();

    }


    // MEMBER

    const member =
        await User.findById(
            userId
        );


    let memberName =
        "A member";


    if (
        member &&
        member.name
    ) {

        memberName =
            member.name;

    }


    // OWNER NOTIFICATION

    await createNotification({

        recipient: project.owner,

        sender: userId,

        type: "member_left",

        title: "Member Left Project",

        message: `${memberName} has left your project "${project.title}".`,

        project: project._id

    });


    // REAL TIME

    try {

        const io =
            getIO();


        io.to(
            `project:${project._id.toString()}`
        ).emit(

            "member_left",

            {

                projectId: project._id,

                memberId: userId,

                currentMembers: project.currentMembers,

                teamSize: project.teamSize,

                status: project.status

            }

        );


    } catch (error) {

        console.error(
            "Real-time member left event failed:",
            error.message
        );

    }


    // OWNER

    const owner =
        await User.findById(
            project.owner
        );


    // OWNER EMAIL

    if (
        owner &&
        owner.email &&
        member
    ) {

        await sendEmail({

            to: owner.email,

            subject: `Member Left - ${project.title}`,

            html: `
                <h2>
                    Hello ${owner.name}
                </h2>

                <p>
                    <strong>${member.name}</strong>
                    has left your project
                    <strong>${project.title}</strong>.
                </p>

                <p>
                    Current team members:
                    ${project.currentMembers}
                    /
                    ${project.teamSize}
                </p>

                <p>
                    Project Partner Finder 🚀
                </p>
            `

        });

    }


    return {

        projectId: project._id,

        currentMembers: project.currentMembers,

        status: project.status

    };

};


// ==========================================
// OWNER REMOVES MEMBER
// ==========================================

const removeProjectMember = async(
    projectId,
    ownerId,
    memberId
) => {

    const project =
        await Project.findById(
            projectId
        );


    if (!project) {

        throw new Error(
            "Project not found"
        );

    }


    // ONLY OWNER

    if (
        project.owner.toString() !==
        ownerId
    ) {

        throw new Error(
            "You are not authorized to remove members from this project"
        );

    }


    // OWNER CANNOT REMOVE SELF

    if (
        project.owner.toString() ===
        memberId
    ) {

        throw new Error(
            "Project owner cannot be removed as a member"
        );

    }


    // MEMBER CHECK

    const isMember =
        project.members.some(
            (userId) =>

            userId.toString() ===
            memberId

        );


    if (!isMember) {

        throw new Error(
            "User is not a member of this project"
        );

    }


    // REMOVE MEMBER

    project.members =
        project.members.filter(
            (userId) =>

            userId.toString() !==
            memberId

        );


    // DECREASE COUNT

    project.currentMembers =
        Math.max(
            project.currentMembers - 1,
            1
        );


    // REOPEN PROJECT

    if (
        project.status ===
        "closed" &&

        project.currentMembers <
        project.teamSize

    ) {

        project.status =
            "open";

    }


    // SAVE PROJECT

    await project.save();


    // UPDATE REQUEST

    const joinRequest =
        await JoinRequest.findOne({

            project: projectId,

            user: memberId

        });


    if (joinRequest) {

        joinRequest.status =
            "removed";


        joinRequest.removedAt =
            new Date();


        joinRequest.removedBy =
            ownerId;


        joinRequest.leftAt =
            null;


        await joinRequest.save();

    }


    // REMOVED MEMBER

    const removedMember =
        await User.findById(
            memberId
        );


    // NOTIFICATION

    await createNotification({

        recipient: memberId,

        sender: ownerId,

        type: "member_removed",

        title: "Removed From Project",

        message: `You have been removed from "${project.title}" by the project owner.`,

        project: project._id

    });


    // REAL TIME

    try {

        const io =
            getIO();


        io.to(
            `project:${project._id.toString()}`
        ).emit(

            "member_removed",

            {

                projectId: project._id,

                memberId: memberId,

                removedBy: ownerId,

                currentMembers: project.currentMembers,

                teamSize: project.teamSize,

                status: project.status

            }

        );


    } catch (error) {

        console.error(
            "Real-time member removal event failed:",
            error.message
        );

    }


    // REMOVAL EMAIL

    if (
        removedMember &&
        removedMember.email
    ) {

        await sendEmail({

            to: removedMember.email,

            subject: `Removed from Project - ${project.title}`,

            html: `
                <h2>
                    Hello ${removedMember.name}
                </h2>

                <p>
                    You have been removed from
                    the project
                    <strong>${project.title}</strong>.
                </p>

                <p>
                    You can send a new join request
                    later if the project is open
                    and has available space.
                </p>

                <p>
                    Project Partner Finder 🚀
                </p>
            `

        });

    }


    // RETURN

    let requestStatus =
        "removed";


    if (
        joinRequest &&
        joinRequest.status
    ) {

        requestStatus =
            joinRequest.status;

    }


    return {

        projectId: project._id,

        removedMemberId: memberId,

        currentMembers: project.currentMembers,

        status: project.status,

        requestStatus: requestStatus

    };

};


// ==========================================
// EXPORT
// ==========================================

export {

    sendJoinRequest,

    getIncomingJoinRequests,

    acceptJoinRequest,

    rejectJoinRequest,

    leaveProject,

    removeProjectMember

};