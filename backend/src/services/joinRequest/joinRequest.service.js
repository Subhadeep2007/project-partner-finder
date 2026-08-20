import Project from "../../models/project.js";
import JoinRequest from "../../models/joinRequest.js";
import User from "../../models/User.js";
import sendEmail from "../../utils/sendEmail.js";
const sendJoinRequest = async(projectId, userId) => {
    // 1. Find project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Project owner cannot join own project
    if (project.owner.toString() === userId) {
        throw new Error(
            "Project owner cannot send a join request"
        );
    }

    // 3. Only open projects can accept requests
    if (project.status !== "open") {
        throw new Error(
            "This project is not open for join requests"
        );
    }

    // 4. Check if team is already full
    if (project.currentMembers >= project.teamSize) {
        throw new Error("Project team is already full");
    }

    // 5. Check if user is already a member
    const isAlreadyMember = project.members.some(
        (memberId) =>
        memberId.toString() === userId
    );

    if (isAlreadyMember) {
        throw new Error(
            "You are already a member of this project"
        );
    }

    // 6. Check existing join request
    const existingRequest = await JoinRequest.findOne({
        project: projectId,
        user: userId
    });

    if (existingRequest) {
        throw new Error(
            `You already have a ${existingRequest.status} join request for this project`
        );
    }

    // 7. Create join request
    const joinRequest = await JoinRequest.create({
        project: projectId,
        user: userId
    });

    return joinRequest;
};
const getIncomingJoinRequests = async(userId) => {
    // Find all projects owned by logged-in user
    const projects = await Project.find({
        owner: userId
    }).select("_id");

    const projectIds = projects.map(
        (project) => project._id
    );

    // Find pending join requests for those projects
    const requests = await JoinRequest.find({
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
            createdAt: -1
        });

    return requests;
};


const acceptJoinRequest = async(requestId, ownerId) => {
    // 1. Find join request
    const joinRequest = await JoinRequest.findById(requestId);

    if (!joinRequest) {
        throw new Error("Join request not found");
    }

    // 2. Request must be pending
    if (joinRequest.status !== "pending") {
        throw new Error(
            `This join request has already been ${joinRequest.status}`
        );
    }

    // 3. Find project
    const project = await Project.findById(
        joinRequest.project
    );

    if (!project) {
        throw new Error("Project not found");
    }

    // 4. Only project owner can accept
    if (project.owner.toString() !== ownerId) {
        throw new Error(
            "You are not authorized to accept this join request"
        );
    }

    // 5. Check if team is full
    if (project.currentMembers >= project.teamSize) {
        throw new Error("Project team is already full");
    }

    // 6. Double-check user is not already a member
    const isAlreadyMember = project.members.some(
        (memberId) =>
        memberId.toString() ===
        joinRequest.user.toString()
    );

    if (isAlreadyMember) {
        throw new Error(
            "User is already a member of this project"
        );
    }

    // 7. Add user to project members
    project.members.push(joinRequest.user);

    // 8. Update member count
    project.currentMembers += 1;

    // 9. If team becomes full, close project
    if (project.currentMembers >= project.teamSize) {
        project.status = "closed";
    }

    await project.save();

    // 10. Update request status
    joinRequest.status = "accepted";
    await joinRequest.save();

    // 11. Get applicant details
    const user = await User.findById(
        joinRequest.user
    );

    // 12. Send acceptance email
    if (user) {
        await sendEmail({
            to: user.email,
            subject: `Join Request Accepted - ${project.title}`,
            html: `
                <h2>Congratulations ${user.name} 🎉</h2>

                <p>Your request to join the project
                <strong>${project.title}</strong>
                has been accepted.</p>

                <p>You are now officially a member of the team.</p>

                <p>Happy building! 🚀</p>
            `
        });
    }

    return {
        requestId: joinRequest._id,
        status: joinRequest.status,
        projectId: project._id
    };
};


const rejectJoinRequest = async(requestId, ownerId) => {
    // 1. Find join request
    const joinRequest = await JoinRequest.findById(requestId);

    if (!joinRequest) {
        throw new Error("Join request not found");
    }

    // 2. Request must be pending
    if (joinRequest.status !== "pending") {
        throw new Error(
            `This join request has already been ${joinRequest.status}`
        );
    }

    // 3. Find project
    const project = await Project.findById(
        joinRequest.project
    );

    if (!project) {
        throw new Error("Project not found");
    }

    // 4. Only project owner can reject
    if (project.owner.toString() !== ownerId) {
        throw new Error(
            "You are not authorized to reject this join request"
        );
    }

    // 5. Update request
    joinRequest.status = "rejected";
    await joinRequest.save();

    // 6. Get applicant details
    const user = await User.findById(
        joinRequest.user
    );

    // 7. Send rejection email
    if (user) {
        await sendEmail({
            to: user.email,
            subject: `Join Request Update - ${project.title}`,
            html: `
                <h2>Hello ${user.name}</h2>

                <p>Your request to join
                <strong>${project.title}</strong>
                was not accepted at this time.</p>

                <p>Don't worry—there are many more projects
                waiting for you! 🚀</p>
            `
        });
    }

    return {
        requestId: joinRequest._id,
        status: joinRequest.status
    };
};


const leaveProject = async(projectId, userId) => {
    // 1. Find project
    const project = await Project.findById(projectId);

    if (!project) {
        throw new Error("Project not found");
    }

    // 2. Owner cannot leave using this route
    if (project.owner.toString() === userId) {
        throw new Error(
            "Project owner cannot leave the project"
        );
    }

    // 3. Check if user is a member
    const isMember = project.members.some(
        (memberId) =>
        memberId.toString() === userId
    );

    if (!isMember) {
        throw new Error(
            "You are not a member of this project"
        );
    }

    // 4. Remove member
    project.members = project.members.filter(
        (memberId) =>
        memberId.toString() !== userId
    );

    // 5. Decrease member count
    project.currentMembers = Math.max(
        project.currentMembers - 1,
        1
    );

    // 6. Reopen project if there is space
    if (
        project.status === "closed" &&
        project.currentMembers < project.teamSize
    ) {
        project.status = "open";
    }

    await project.save();

    // 7. Get leaving member details
    const member = await User.findById(userId);

    // 8. Get project owner details
    const owner = await User.findById(project.owner);

    // 9. Send email to owner
    if (owner && member) {
        await sendEmail({
            to: owner.email,
            subject: `Member Left - ${project.title}`,
            html: `
                <h2>Hello ${owner.name}</h2>

                <p>
                    <strong>${member.name}</strong>
                    has left your project
                    <strong>${project.title}</strong>.
                </p>

                <p>
                    Current team members:
                    ${project.currentMembers} / ${project.teamSize}
                </p>

                <p>Project Partner Finder 🚀</p>
            `
        });
    }

    return {
        projectId: project._id,
        currentMembers: project.currentMembers,
        status: project.status
    };
};
export {
    sendJoinRequest,
    getIncomingJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    leaveProject
};