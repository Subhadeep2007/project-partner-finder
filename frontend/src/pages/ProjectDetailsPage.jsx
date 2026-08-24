import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    deleteProject,
    getProjectById,
    updateProjectStatus
} from "../services/project.service";

import {
    sendJoinRequest
} from "../services/joinRequest.service";


const getCurrentUserId = () => {

    try {

        const token =
            localStorage.getItem(
                "accessToken"
            );

        if (!token) {
            return null;
        }

        const payload =
            token.split(".")[1];

        const decoded =
            JSON.parse(
                atob(
                    payload
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

        return decoded.userId;

    } catch (error) {

        return null;

    }

};


const ProjectDetailsPage = () => {

    const { projectId } =
        useParams();

    const navigate =
        useNavigate();

    const currentUserId =
        getCurrentUserId();


    const [project, setProject] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [deleting, setDeleting] =
        useState(false);

    const [updatingStatus, setUpdatingStatus] =
        useState(false);

    const [sendingRequest, setSendingRequest] =
        useState(false);


    useEffect(() => {

        const fetchProject =
            async() => {

                try {

                    setLoading(true);
                    setError("");

                    const response =
                        await getProjectById(
                            projectId
                        );

                    setProject(
                        response.data
                    );

                } catch (error) {

                    setError(
                        error.response?.data?.message ||
                        "Failed to load project"
                    );

                } finally {

                    setLoading(false);

                }

            };


        fetchProject();

    }, [projectId]);


    const handleDelete =
        async() => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this project?"
                );

            if (!confirmed) {
                return;
            }

            try {

                setDeleting(true);
                setError("");

                await deleteProject(
                    projectId
                );

                navigate(
                    "/dashboard"
                );

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Failed to delete project"
                );

            } finally {

                setDeleting(false);

            }

        };


    const handleStatusChange =
        async() => {

            const newStatus =
                project.status === "open"
                    ? "closed"
                    : "open";

            try {

                setUpdatingStatus(true);
                setError("");

                const response =
                    await updateProjectStatus(
                        projectId,
                        newStatus
                    );

                setProject(
                    response.data
                );

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Failed to update project status"
                );

            } finally {

                setUpdatingStatus(false);

            }

        };


    const handleJoinRequest =
        async() => {

            try {

                setSendingRequest(true);
                setError("");

                const response =
                    await sendJoinRequest(
                        projectId
                    );

                alert(
                    response.message ||
                    "Join request sent successfully"
                );

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Failed to send join request"
                );

            } finally {

                setSendingRequest(false);

            }

        };


    if (loading) {

        return (

            <div className="project-details-state">

                Loading project...

            </div>

        );

    }


    if (error && !project) {

        return (

            <div
                className="
                    project-details-state
                    project-details-state--error
                "
            >

                {error}

            </div>

        );

    }


    if (!project) {

        return (

            <div className="project-details-state">

                Project not found.

            </div>

        );

    }


    const isOwner =
        project.owner?._id?.toString() ===
        currentUserId?.toString();


    const isMember =
        project.members?.some(
            (member) =>
                member?._id?.toString() ===
                    currentUserId?.toString() ||
                member?.toString() ===
                    currentUserId?.toString()
        );


    const allTeamMembers = [

        ...(project.owner
            ? [project.owner]
            : []),

        ...(project.members || [])

    ];


    return (

        <div className="project-details-page">


            <Link
                to="/projects"
                className="project-details__back"
            >

                ← Back to Projects

            </Link>


            <div className="project-details__header">


                <div>

                    <p
                        className="
                            project-details__terminal
                        "
                    >

                        $ project-details

                    </p>


                    <h1>

                        {project.title}

                    </h1>

                </div>


                <div
                    className="
                        project-details__header-right
                    "
                >


                    <div
                        className="
                            project-details__status
                        "
                    >

                        {project.status?.toUpperCase()}

                    </div>


                    {isOwner && (

                        <div
                            className="
                                project-details__actions
                            "
                        >

                            <Link
                                to={
                                    `/projects/${projectId}/edit`
                                }
                                className="
                                    project-action
                                    project-action--edit
                                "
                            >

                                Edit

                            </Link>


                            <button
                                type="button"
                                className="
                                    project-action
                                    project-action--delete
                                "
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    deleting
                                }
                            >

                                {deleting
                                    ? "Deleting..."
                                    : "Delete"}

                            </button>


                            <button
                                type="button"
                                className="
                                    project-action
                                    project-action--status
                                "
                                onClick={
                                    handleStatusChange
                                }
                                disabled={
                                    updatingStatus
                                }
                            >

                                {updatingStatus
                                    ? "Updating..."
                                    : project.status ===
                                        "open"
                                        ? "Close Project"
                                        : "Reopen Project"}

                            </button>

                        </div>

                    )}


                    {!isOwner &&
                        !isMember &&
                        project.status === "open" && (

                        <div
                            className="
                                project-details__actions
                            "
                        >

                            <button
                                type="button"
                                className="
                                    project-action
                                    project-action--join
                                "
                                onClick={
                                    handleJoinRequest
                                }
                                disabled={
                                    sendingRequest
                                }
                            >

                                {sendingRequest
                                    ? "Sending Request..."
                                    : "Request to Join"}

                            </button>

                        </div>

                    )}


                    {(isOwner || isMember) && (

                        <Link
                            to={
                                `/projects/${projectId}/chat`
                            }
                            className="
                                project-action
                                project-action--chat
                            "
                        >

                            💬 Open Team Chat

                        </Link>

                    )}

                </div>

            </div>


            {error && (

                <div
                    className="
                        project-details-error
                    "
                >

                    {error}

                </div>

            )}


            <div
                className="
                    project-details__grid
                "
            >


                <section
                    className="
                        project-details__main
                    "
                >


                    <div
                        className="
                            project-details__section
                        "
                    >

                        <h2>

                            About Project

                        </h2>


                        <p>

                            {project.description}

                        </p>

                    </div>


                    <div
                        className="
                            project-details__section
                        "
                    >

                        <h2>

                            Required Skills

                        </h2>


                        <div
                            className="
                                project-details__skills
                            "
                        >

                            {project.requiredSkills?.map(
                                (skill) => (

                                    <span
                                        key={skill}
                                    >

                                        {skill}

                                    </span>

                                )
                            )}

                        </div>

                    </div>


                    {/* TEAM MEMBERS */}

                    <div
                        className="
                            project-details__section
                        "
                    >

                        <div
                            className="
                                project-team__heading
                            "
                        >

                            <div>

                                <h2>

                                    Team Members

                                </h2>

                                <p>

                                    {allTeamMembers.length}
                                    {" "}
                                    member
                                    {allTeamMembers.length !== 1
                                        ? "s"
                                        : ""}

                                </p>

                            </div>

                        </div>


                        <div
                            className="
                                project-team__list
                            "
                        >

                            {allTeamMembers.map(
                                (
                                    member,
                                    index
                                ) => {

                                    const memberId =
                                        member?._id ||
                                        member;

                                    const isCurrentUser =
                                        memberId?.toString() ===
                                        currentUserId?.toString();

                                    const isProjectOwner =
                                        memberId?.toString() ===
                                        project.owner?._id?.toString();


                                    return (

                                        <div
                                            key={
                                                memberId?.toString() ||
                                                index
                                            }
                                            className="
                                                project-member-card
                                            "
                                        >


                                            <Link
                                                to={
                                                    `/users/${memberId}`
                                                }
                                                className="
                                                    project-member-card__profile
                                                "
                                            >

                                                {member?.profileImage ? (

                                                    <img
                                                        src={
                                                            member.profileImage
                                                        }
                                                        alt={
                                                            member.name ||
                                                            "User"
                                                        }
                                                    />

                                                ) : (

                                                    <div
                                                        className="
                                                            project-member-card__avatar
                                                        "
                                                    >

                                                        {member?.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "U"}

                                                    </div>

                                                )}

                                            </Link>


                                            <div
                                                className="
                                                    project-member-card__info
                                                "
                                            >

                                                <Link
                                                    to={
                                                        `/users/${memberId}`
                                                    }
                                                    className="
                                                        project-member-card__name
                                                    "
                                                >

                                                    {member?.name ||
                                                        "Unknown User"}

                                                </Link>


                                                <div
                                                    className="
                                                        project-member-card__badges
                                                    "
                                                >

                                                    {isProjectOwner && (

                                                        <span
                                                            className="
                                                                member-badge
                                                                member-badge--owner
                                                            "
                                                        >

                                                            Owner

                                                        </span>

                                                    )}


                                                    {isCurrentUser && (

                                                        <span
                                                            className="
                                                                member-badge
                                                                member-badge--you
                                                            "
                                                        >

                                                            You

                                                        </span>

                                                    )}

                                                </div>


                                                {member?.skills?.length > 0 && (

                                                    <div
                                                        className="
                                                            project-member-card__skills
                                                        "
                                                    >

                                                        {member.skills
                                                            .slice(0, 4)
                                                            .map(
                                                                (
                                                                    skill
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            skill
                                                                        }
                                                                    >

                                                                        {skill}

                                                                    </span>

                                                                )
                                                            )}

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </div>

                </section>


                <aside
                    className="
                        project-details__sidebar
                    "
                >


                    <div
                        className="
                            project-info-card
                        "
                    >


                        <div
                            className="
                                project-info-card__item
                            "
                        >

                            <span>

                                TEAM SIZE

                            </span>


                            <strong>

                                {allTeamMembers.length}
                                {" / "}
                                {project.teamSize}

                            </strong>

                        </div>


                        <div
                            className="
                                project-info-card__item
                            "
                        >

                            <span>

                                PROJECT OWNER

                            </span>


                            <Link
                                to={
                                    `/users/${project.owner?._id}`
                                }
                                className="
                                    project-owner-preview
                                "
                            >

                                {project.owner?.profileImage ? (

                                    <img
                                        src={
                                            project.owner.profileImage
                                        }
                                        alt={
                                            project.owner?.name
                                        }
                                    />

                                ) : (

                                    <div
                                        className="
                                            project-owner-preview__avatar
                                        "
                                    >

                                        {project.owner?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            "U"}

                                    </div>

                                )}


                                <strong>

                                    {project.owner?.name ||
                                        "Unknown"}

                                </strong>

                            </Link>

                        </div>

                    </div>

                </aside>

            </div>

        </div>

    );

};


export default ProjectDetailsPage;