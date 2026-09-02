import { useEffect, useState } from "react";
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
    sendJoinRequest,
    removeProjectMember,
    leaveProject
} from "../services/joinRequest.service";


// ==========================================
// HELPERS
// ==========================================

const getCurrentUserId = () => {
    try {
        const userData =
            localStorage.getItem("user");

        if (userData) {
            const user =
                JSON.parse(userData);

            const id =
                user._id ||
                user.id ||
                user.userId ||
                user.user?.id ||
                user.user?._id;

            if (id) {
                return id.toString();
            }
        }

        const token =
            localStorage.getItem(
                "accessToken"
            );

        if (!token) {
            return null;
        }

        const payload =
            token.split(".")[1];

        if (!payload) {
            return null;
        }

        const decoded =
            JSON.parse(
                atob(
                    payload
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

        return decoded.userId
            ? decoded.userId.toString()
            : null;

    } catch {
        return null;
    }
};


const getUserId = (user) => {
    if (!user) {
        return null;
    }

    return (
        user._id ||
        user.id ||
        user.userId
    )?.toString() || null;
};


const formatDate = (value) => {
    if (!value) {
        return "Not specified";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not specified";
    }

    return date.toLocaleDateString(
        [],
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};


const stageLabel = (stage) => {
    if (!stage) {
        return "Not specified";
    }

    return stage
        .split("-")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
};


const commitmentLabel = (
    value
) => {
    if (!value) {
        return "Not specified";
    }

    if (value === "part-time") {
        return "Part-time";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
};


const modeLabel = (value) => {
    if (!value) {
        return "Not specified";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
};


const roleLabel = (value) => {
    const labels = {
        frontend: "Frontend",
        backend: "Backend",
        fullstack: "Full Stack",
        "ai-ml": "AI / ML",
        "data-science": "Data Science",
        "ui-ux": "UI / UX",
        devops: "DevOps",
        mobile: "Mobile",
        other: "Other"
    };

    return labels[value] || value;
};


const ProjectDetailsPage = () => {

    const {
        projectId
    } = useParams();

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

    const [removingMemberId, setRemovingMemberId] =
        useState(null);


    // ==========================================
    // FETCH PROJECT
    // ==========================================

    useEffect(() => {

        let mounted = true;
const accessToken =
        localStorage.getItem("accessToken");

    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!accessToken) {
        setError("Please login first");
        setLoading(false);
        return;
    }

        const fetchProject =
            async () => {

                try {

                    setLoading(true);
                    setError("");

                    const response =
                        await getProjectById(
                            projectId
                        );

                    if (mounted) {

                        setProject(
                            response.data
                        );

                    }

                } catch (error) {

                    if (mounted) {

                        setError(
                            error?.response?.data?.message ||
                            error?.message ||
                            "Failed to load project"
                        );

                    }

                } finally {

                    if (mounted) {
                        setLoading(false);
                    }

                }

            };


        if (projectId) {
            fetchProject();
        }

        return () => {
            mounted = false;
        };

    }, [projectId]);


    // ==========================================
    // DELETE PROJECT
    // ==========================================

    const handleDelete =
        async () => {

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
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to delete project"
                );

                setDeleting(false);

            }

        };


    // ==========================================
    // STATUS CHANGE
    // ==========================================

    const handleStatusChange =
        async () => {

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
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to update project status"
                );

            } finally {

                setUpdatingStatus(false);

            }

        };


    // ==========================================
    // JOIN REQUEST
    // ==========================================

    const handleJoinRequest =
        async () => {

            try {

                setSendingRequest(true);
                setError("");

                const response =
                    await sendJoinRequest(
                        projectId
                    );

                window.alert(
                    response?.message ||
                    "Join request sent successfully"
                );

            } catch (error) {

                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to send join request"
                );

            } finally {

                setSendingRequest(false);

            }

        };


    // ==========================================
    // REMOVE MEMBER
    // ==========================================

    const handleRemoveMember =
        async (member) => {

            const memberId =
                getUserId(member);

            if (!memberId) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Remove ${member?.name || "this member"} from the project?`
                );

            if (!confirmed) {
                return;
            }

            try {

                setRemovingMemberId(
                    memberId
                );

                setError("");

                await removeProjectMember(
                    projectId,
                    memberId
                );

                setProject(
                    (previous) => {

                        if (!previous) {
                            return previous;
                        }

                        return {
                            ...previous,

                            members:
                                Array.isArray(
                                    previous.members
                                )
                                    ?
                                    previous.members.filter(
                                        (item) =>
                                            getUserId(item) !==
                                            memberId
                                    )
                                    :
                                    [],

                            currentMembers:
                                Math.max(
                                    Number(
                                        previous.currentMembers
                                    ) - 1,
                                    1
                                ),

                            status:
                                previous.status === "closed" &&
                                Number(
                                    previous.currentMembers
                                ) - 1 <
                                    Number(
                                        previous.teamSize
                                    )
                                    ?
                                    "open"
                                    :
                                    previous.status
                        };

                    }
                );

            } catch (error) {

                setError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to remove project member"
                );

            } finally {

                setRemovingMemberId(
                    null
                );

            }

        };

const handleLeaveProject =
    async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to leave this project?"
            );

        if (!confirmed) {
            return;
        }


        try {

            setError("");


            await leaveProject(
                projectId
            );


            navigate(
                "/projects"
            );


        } catch (error) {

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to leave project"
            );

        }

    };
    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <main
                className="
                    !min-h-screen
                    !w-full
                    !bg-[#070b0f]
                    !px-4
                    !py-8
                    !font-sans
                    !text-white
                    sm:!px-6
                    lg:!px-10
                "
            >

                <div
                    className="
                        !mx-auto
                        !w-full
                        !max-w-7xl
                    "
                >

                    <div
                        className="
                            !animate-pulse
                            !space-y-4
                        "
                    >

                        <div
                            className="
                                !h-4
                                !w-32
                                !rounded
                                !bg-slate-800
                            "
                        />

                        <div
                            className="
                                !h-12
                                !w-2/3
                                !rounded-lg
                                !bg-slate-800
                            "
                        />

                        <div
                            className="
                                !h-64
                                !w-full
                                !rounded-2xl
                                !bg-slate-900
                            "
                        />

                    </div>

                </div>

            </main>

        );

    }


    // ==========================================
    // ERROR / EMPTY
    // ==========================================

    if (error && !project) {

        return (

            <main
                className="
                    !min-h-screen
                    !w-full
                    !bg-[#070b0f]
                    !px-4
                    !py-8
                    !font-sans
                    !text-white
                    sm:!px-6
                    lg:!px-10
                "
            >

                <div
                    className="
                        !mx-auto
                        !w-full
                        !max-w-3xl
                    "
                >

                    <div
                        className="
                            !rounded-2xl
                            !border
                            !border-red-500/30
                            !bg-red-500/10
                            !p-6
                            !text-sm
                            !leading-6
                            !text-red-300
                        "
                    >
                        {error}
                    </div>

                </div>

            </main>

        );

    }


    if (!project) {

        return (

            <main
                className="
                    !min-h-screen
                    !w-full
                    !bg-[#070b0f]
                    !px-4
                    !py-8
                    !font-sans
                    !text-white
                "
            >

                <div
                    className="
                        !mx-auto
                        !max-w-3xl
                        !rounded-2xl
                        !border
                        !border-white/10
                        !bg-[#0d151d]
                        !p-8
                        !text-center
                    "
                >

                    <h1
                        className="
                            !m-0
                            !text-2xl
                            !font-bold
                        "
                    >
                        Project not found
                    </h1>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/projects"
                            )
                        }
                        className="
                            !mt-6
                            !rounded-xl
                            !border
                            !border-emerald-400/50
                            !px-5
                            !py-3
                            !text-sm
                            !font-semibold
                            !text-emerald-300
                            hover:!bg-emerald-400/10
                        "
                    >
                        Back to Projects
                    </button>

                </div>

            </main>

        );

    }


    const ownerId =
        getUserId(
            project.owner
        );

    const isOwner =
        ownerId ===
        currentUserId;

    const isMember =
        Array.isArray(
            project.members
        ) &&
        project.members.some(
            (member) =>
                getUserId(member) ===
                currentUserId
        );

    const currentMembers =
        Number(
            project.currentMembers ??
            (
                1 +
                (
                    Array.isArray(project.members)
                        ?
                        project.members.length
                        :
                        0
                )
            )
        );

    const memberLimit =
        Number(
            project.teamSize || 0
        );

    const canChat =
        isOwner ||
        isMember;


    return (

        <main
            className="
                !min-h-screen
                !w-full
                !bg-[#070b0f]
                !px-3
                !py-6
                !font-sans
                !text-white
                sm:!px-5
                sm:!py-8
                lg:!px-8
            "
        >

            <div
                className="
                    !mx-auto
                    !w-full
                    !max-w-7xl
                "
            >

                {/* ==========================================
                    TOP NAV
                ========================================== */}

                <div
                    className="
                        !mb-6
                        !flex
                        !flex-col
                        !gap-4
                        sm:!flex-row
                        sm:!items-center
                        sm:!justify-between
                    "
                >

                    <Link
                        to="/projects"
                        className="
                            !inline-flex
                            !w-fit
                            !items-center
                            !gap-2
                            !rounded-lg
                            !border
                            !border-white/10
                            !bg-white/[0.02]
                            !px-3
                            !py-2
                            !text-sm
                            !font-medium
                            !text-slate-300
                            !transition
                            hover:!border-white/20
                            hover:!bg-white/[0.05]
                            hover:!text-white
                        "
                    >
                        ← Back to Projects
                    </Link>

                    <div
                        className="
                            !flex
                            !flex-wrap
                            !items-center
                            !gap-2
                        "
                    >

                        <span
                            className="
                                !rounded-full
                                !border
                                !border-emerald-400/40
                                !bg-emerald-400/10
                                !px-3
                                !py-1.5
                                !text-xs
                                !font-bold
                                !uppercase
                                !tracking-wide
                                !text-emerald-300
                            "
                        >
                            {project.status || "open"}
                        </span>

                        <span
                            className="
                                !rounded-full
                                !border
                                !border-cyan-400/30
                                !bg-cyan-400/10
                                !px-3
                                !py-1.5
                                !text-xs
                                !font-semibold
                                !text-cyan-300
                            "
                        >
                            {stageLabel(project.stage)}
                        </span>

                    </div>

                </div>


                {/* ==========================================
                    ERROR
                ========================================== */}

                {error && (

                    <div
                        className="
                            !mb-6
                            !rounded-xl
                            !border
                            !border-red-500/30
                            !bg-red-500/10
                            !px-4
                            !py-3
                            !text-sm
                            !leading-6
                            !text-red-300
                        "
                    >
                        {error}
                    </div>

                )}


                {/* ==========================================
                    HERO
                ========================================== */}

                <section
                    className="
                        !rounded-3xl
                        !border
                        !border-white/10
                        !bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_35%),#0d151d]
                        !p-5
                        !shadow-2xl
                        !shadow-black/20
                        sm:!p-7
                        lg:!p-9
                    "
                >

                    <div
                        className="
                            !flex
                            !flex-col
                            !gap-7
                            xl:!flex-row
                            xl:!items-end
                            xl:!justify-between
                        "
                    >

                        <div className="!min-w-0">

                            <p
                                className="
                                    !mb-2
                                    !font-mono
                                    !text-xs
                                    !font-semibold
                                    !text-emerald-400
                                    sm:!text-sm
                                "
                            >
                                $ project-details
                            </p>

                            <h1
                                className="
                                    !m-0
                                    !break-words
                                    !text-3xl
                                    !font-extrabold
                                    !leading-tight
                                    !tracking-tight
                                    !text-white
                                    sm:!text-4xl
                                    lg:!text-5xl
                                "
                            >
                                {project.title}
                            </h1>

                            <div
                                className="
                                    !mt-4
                                    !flex
                                    !flex-wrap
                                    !items-center
                                    !gap-3
                                "
                            >

                                <span
                                    className="
                                        !text-sm
                                        !text-slate-400
                                    "
                                >
                                    {currentMembers} / {memberLimit} members
                                </span>

                                <span
                                    className="
                                        !h-1
                                        !w-1
                                        !rounded-full
                                        !bg-slate-600
                                    "
                                />

                                <span
                                    className="
                                        !text-sm
                                        !text-slate-400
                                    "
                                >
                                    Created {formatDate(project.createdAt)}
                                </span>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div
                            className="
                                !flex
                                !w-full
                                !flex-col
                                !gap-2
                                sm:!flex-row
                                sm:!flex-wrap
                                xl:!w-auto
                                xl:!justify-end
                            "
                        >

                            {isOwner && (

                                <>
                                    <Link
                                        to={`/projects/${projectId}/edit`}
                                        className="
                                            !inline-flex
                                            !min-h-11
                                            !items-center
                                            !justify-center
                                            !rounded-xl
                                            !border
                                            !border-emerald-400/60
                                            !bg-transparent
                                            !px-5
                                            !py-2.5
                                            !text-sm
                                            !font-bold
                                            !text-emerald-300
                                            !transition
                                            hover:!bg-emerald-400
                                            hover:!text-black
                                        "
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={
                                            handleDelete
                                        }
                                        disabled={deleting}
                                        className="
                                            !min-h-11
                                            !rounded-xl
                                            !border
                                            !border-red-400/60
                                            !bg-transparent
                                            !px-5
                                            !py-2.5
                                            !text-sm
                                            !font-bold
                                            !text-red-300
                                            !transition
                                            hover:!bg-red-400
                                            hover:!text-white
                                            disabled:!cursor-not-allowed
                                            disabled:!opacity-50
                                        "
                                    >
                                        {deleting
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleStatusChange
                                        }
                                        disabled={
                                            updatingStatus
                                        }
                                        className="
                                            !min-h-11
                                            !rounded-xl
                                            !border
                                            !border-cyan-400/50
                                            !bg-cyan-400/10
                                            !px-5
                                            !py-2.5
                                            !text-sm
                                            !font-bold
                                            !text-cyan-300
                                            !transition
                                            hover:!bg-cyan-400
                                            hover:!text-black
                                            disabled:!cursor-not-allowed
                                            disabled:!opacity-50
                                        "
                                    >
                                        {updatingStatus
                                            ? "Updating..."
                                            : project.status ===
                                                "open"
                                                ? "Close Project"
                                                : "Reopen Project"}
                                    </button>
                                </>

                            )}


                            {!isOwner &&
                                !isMember &&
                                project.status ===
                                    "open" && (

                                <button
                                    type="button"
                                    onClick={
                                        handleJoinRequest
                                    }
                                    disabled={
                                        sendingRequest
                                    }
                                    className="
                                        !min-h-11
                                        !rounded-xl
                                        !border
                                        !border-emerald-400/60
                                        !bg-emerald-400
                                        !px-5
                                        !py-2.5
                                        !text-sm
                                        !font-bold
                                        !text-black
                                        !transition
                                        hover:!bg-emerald-300
                                        disabled:!cursor-not-allowed
                                        disabled:!opacity-60
                                    "
                                >
                                    {sendingRequest
                                        ? "Sending Request..."
                                        : "Request to Join"}
                                </button>

                            )}


                            {canChat && (

                                <Link
                                    to={`/projects/${projectId}/chat`}
                                    className="
                                        !inline-flex
                                        !min-h-11
                                        !items-center
                                        !justify-center
                                        !rounded-xl
                                        !border
                                        !border-white/10
                                        !bg-white/[0.04]
                                        !px-5
                                        !py-2.5
                                        !text-sm
                                        !font-semibold
                                        !text-white
                                        !transition
                                        hover:!border-white/20
                                        hover:!bg-white/[0.08]
                                    "
                                >
                                    💬 Open Team Chat
                                </Link>

                            )}
{isMember && !isOwner && (

    <button
        type="button"
        onClick={
            handleLeaveProject
        }
        className="
            !min-h-11
            !rounded-xl
            !border
            !border-orange-400/50
            !bg-orange-400/10
            !px-5
            !py-2.5
            !text-sm
            !font-bold
            !text-orange-300
            !transition
            hover:!border-orange-400
            hover:!bg-orange-400
            hover:!text-black
        "
    >
        Leave Project
    </button>

)}
                        </div>

                    </div>

                </section>


                {/* ==========================================
                    MAIN GRID
                ========================================== */}

                <div
                    className="
                        !mt-6
                        !grid
                        !gap-6
                        xl:!grid-cols-[minmax(0,1fr)_340px]
                    "
                >

                    {/* MAIN */}

                    <div
                        className="
                            !min-w-0
                            !space-y-6
                        "
                    >

                        {/* ABOUT */}

                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-7
                            "
                        >

                            <div className="!mb-5">

                                <p
                                    className="
                                        !mb-1
                                        !font-mono
                                        !text-xs
                                        !font-semibold
                                        !uppercase
                                        !tracking-widest
                                        !text-emerald-400
                                    "
                                >
                                    Overview
                                </p>

                                <h2
                                    className="
                                        !m-0
                                        !text-xl
                                        !font-bold
                                        !text-white
                                    "
                                >
                                    About Project
                                </h2>

                            </div>

                            <p
                                className="
                                    !m-0
                                    !whitespace-pre-wrap
                                    !text-sm
                                    !leading-7
                                    !text-slate-300
                                    sm:!text-base
                                "
                            >
                                {project.description}
                            </p>

                        </section>


                        {/* PROJECT INFO GRID */}

                        <section
                            className="
                                !grid
                                !gap-3
                                sm:!grid-cols-2
                                lg:!grid-cols-3
                            "
                        >

                            {[
                                [
                                    "Project Stage",
                                    stageLabel(project.stage),
                                    "text-emerald-300"
                                ],
                                [
                                    "Team",
                                    `${currentMembers} / ${memberLimit}`,
                                    "text-cyan-300"
                                ],
                                [
                                    "Commitment",
                                    commitmentLabel(
                                        project.commitment
                                    ),
                                    "text-amber-300"
                                ],
                                [
                                    "Mode",
                                    modeLabel(
                                        project.collaborationMode
                                    ),
                                    "text-violet-300"
                                ],
                                [
                                    "Deadline",
                                    formatDate(
                                        project.deadline
                                    ),
                                    "text-pink-300"
                                ],
                                [
                                    "Status",
                                    project.status ||
                                        "open",
                                    "text-emerald-300"
                                ]
                            ].map(
                                (
                                    [
                                        label,
                                        value,
                                        accent
                                    ]
                                ) => (

                                    <div
                                        key={label}
                                        className="
                                            !rounded-2xl
                                            !border
                                            !border-white/10
                                            !bg-[#0d151d]
                                            !p-4
                                            sm:!p-5
                                        "
                                    >

                                        <p
                                            className="
                                                !m-0
                                                !text-[11px]
                                                !font-mono
                                                !font-semibold
                                                !uppercase
                                                !tracking-widest
                                                !text-slate-500
                                            "
                                        >
                                            {label}
                                        </p>

                                        <p
                                            className={`
                                                !mt-2
                                                !mb-0
                                                !text-base
                                                !font-bold
                                                ${accent}
                                            `}
                                        >
                                            {value}
                                        </p>

                                    </div>

                                )
                            )}

                        </section>


                        {/* GITHUB */}

                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-7
                            "
                        >

                            <div
                                className="
                                    !flex
                                    !flex-col
                                    !gap-4
                                    sm:!flex-row
                                    sm:!items-center
                                    sm:!justify-between
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            !mb-1
                                            !font-mono
                                            !text-xs
                                            !font-semibold
                                            !uppercase
                                            !tracking-widest
                                            !text-slate-500
                                        "
                                    >
                                        Source Code
                                    </p>

                                    <h2
                                        className="
                                            !m-0
                                            !text-xl
                                            !font-bold
                                        "
                                    >
                                        GitHub Repository
                                    </h2>

                                </div>

                                {project.githubRepo ? (

                                    <a
                                        href={
                                            project.githubRepo
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="
                                            !inline-flex
                                            !min-h-11
                                            !items-center
                                            !justify-center
                                            !rounded-xl
                                            !border
                                            !border-white/10
                                            !bg-white/[0.04]
                                            !px-4
                                            !py-2.5
                                            !text-sm
                                            !font-semibold
                                            !text-emerald-300
                                            !transition
                                            hover:!border-emerald-400/40
                                            hover:!bg-emerald-400/10
                                        "
                                    >
                                        Open Repository ↗
                                    </a>

                                ) : (

                                    <span
                                        className="
                                            !text-sm
                                            !text-slate-500
                                        "
                                    >
                                        Repository not available
                                    </span>

                                )}

                            </div>

                            {project.githubRepo && (

                                <p
                                    className="
                                        !mt-5
                                        !mb-0
                                        !break-all
                                        !rounded-xl
                                        !border
                                        !border-white/10
                                        !bg-black/20
                                        !px-4
                                        !py-3
                                        !font-mono
                                        !text-xs
                                        !leading-5
                                        !text-slate-400
                                    "
                                >
                                    {project.githubRepo}
                                </p>

                            )}

                        </section>


                        {/* REQUIRED SKILLS */}

                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-7
                            "
                        >

                            <p
                                className="
                                    !mb-1
                                    !font-mono
                                    !text-xs
                                    !font-semibold
                                    !uppercase
                                    !tracking-widest
                                    !text-emerald-400
                                "
                            >
                                Tech Stack
                            </p>

                            <h2
                                className="
                                    !m-0
                                    !text-xl
                                    !font-bold
                                "
                            >
                                Required Skills
                            </h2>

                            <div
                                className="
                                    !mt-5
                                    !flex
                                    !flex-wrap
                                    !gap-2
                                "
                            >

                                {Array.isArray(
                                    project.requiredSkills
                                ) &&
                                project.requiredSkills.length > 0
                                    ? project.requiredSkills.map(
                                        (skill) => (
                                            <span
                                                key={skill}
                                                className="
                                                    !rounded-full
                                                    !border
                                                    !border-emerald-400/20
                                                    !bg-emerald-400/10
                                                    !px-3
                                                    !py-1.5
                                                    !font-mono
                                                    !text-xs
                                                    !font-semibold
                                                    !text-emerald-300
                                                "
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )
                                    : (
                                        <span
                                            className="
                                                !text-sm
                                                !text-slate-500
                                            "
                                        >
                                            No skills specified.
                                        </span>
                                    )}

                            </div>

                        </section>


                        {/* LOOKING FOR */}

                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-7
                            "
                        >

                            <p
                                className="
                                    !mb-1
                                    !font-mono
                                    !text-xs
                                    !font-semibold
                                    !uppercase
                                    !tracking-widest
                                    !text-emerald-400
                                "
                            >
                                Team Building
                            </p>

                            <h2
                                className="
                                    !m-0
                                    !text-xl
                                    !font-bold
                                "
                            >
                                Looking For
                            </h2>

                            <div
                                className="
                                    !mt-5
                                    !grid
                                    !gap-3
                                    sm:!grid-cols-2
                                    lg:!grid-cols-3
                                "
                            >

                                {Array.isArray(
                                    project.lookingFor
                                ) &&
                                project.lookingFor.length > 0
                                    ? project.lookingFor.map(
                                        (role) => (
                                            <div
                                                key={role}
                                                className="
                                                    !rounded-xl
                                                    !border
                                                    !border-white/10
                                                    !bg-black/10
                                                    !px-4
                                                    !py-3
                                                    !text-sm
                                                    !font-semibold
                                                    !text-slate-300
                                                "
                                            >
                                                {roleLabel(role)}
                                            </div>
                                        )
                                    )
                                    : (
                                        <p
                                            className="
                                                !m-0
                                                !text-sm
                                                !text-slate-500
                                            "
                                        >
                                            No specific roles listed.
                                        </p>
                                    )}

                            </div>

                        </section>


                        {/* TEAM MEMBERS */}

                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-7
                            "
                        >

                            <div
                                className="
                                    !flex
                                    !flex-col
                                    !gap-2
                                    sm:!flex-row
                                    sm:!items-end
                                    sm:!justify-between
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            !mb-1
                                            !font-mono
                                            !text-xs
                                            !font-semibold
                                            !uppercase
                                            !tracking-widest
                                            !text-emerald-400
                                        "
                                    >
                                        People
                                    </p>

                                    <h2
                                        className="
                                            !m-0
                                            !text-xl
                                            !font-bold
                                        "
                                    >
                                        Team Members
                                    </h2>

                                </div>

                                <p
                                    className="
                                        !m-0
                                        !text-sm
                                        !text-slate-500
                                    "
                                >
                                    {currentMembers} of{" "}
                                    {memberLimit} seats filled
                                </p>

                            </div>


                            <div
                                className="
                                    !mt-6
                                    !space-y-3
                                "
                            >

                                {/* OWNER */}

                                <Link
                                    to={
                                        ownerId === currentUserId
                                            ? "/profile"
                                            : ownerId
                                                ? `/profile/${ownerId}`
                                                : "#"
                                    }
                                    state={
                                        ownerId === currentUserId
                                            ? undefined
                                            : {
                                                user: project.owner
                                            }
                                    }
                                    className="
                                        !block
                                        !rounded-2xl
                                        !border
                                        !border-emerald-400/20
                                        !bg-emerald-400/[0.04]
                                        !p-4
                                        !transition
                                        hover:!border-emerald-400/40
                                        hover:!bg-emerald-400/[0.07]
                                    "
                                >

                                    <div
                                        className="
                                            !flex
                                            !items-center
                                            !gap-4
                                        "
                                    >

                                        <div
                                            className="
                                                !h-20
                                                !w-20
                                                !shrink-0
                                                !overflow-hidden
                                                !rounded-2xl
                                                !border
                                                !border-emerald-400/40
                                                !bg-slate-900
                                                sm:!h-24
                                                sm:!w-24
                                            "
                                        >

                                            {project.owner?.profileImage ? (

                                                <img
                                                    src={
                                                        project
                                                            .owner
                                                            .profileImage
                                                    }
                                                    alt={
                                                        project
                                                            .owner
                                                            .name ||
                                                        "Project owner"
                                                    }
                                                    className="
                                                        !h-full
                                                        !w-full
                                                        !object-cover
                                                    "
                                                />

                                            ) : (

                                                <div
                                                    className="
                                                        !flex
                                                        !h-full
                                                        !w-full
                                                        !items-center
                                                        !justify-center
                                                        !bg-emerald-400/10
                                                        !text-2xl
                                                        !font-bold
                                                        !text-emerald-300
                                                    "
                                                >
                                                    {
                                                        (
                                                            project.owner?.name ||
                                                            "O"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    }
                                                </div>

                                            )}

                                        </div>


                                        <div
                                            className="
                                                !min-w-0
                                                !flex-1
                                            "
                                        >

                                            <div
                                                className="
                                                    !flex
                                                    !flex-wrap
                                                    !items-center
                                                    !gap-2
                                                "
                                            >

                                                <h3
                                                    className="
                                                        !m-0
                                                        !truncate
                                                        !text-base
                                                        !font-bold
                                                        !text-white
                                                    "
                                                >
                                                    {project.owner?.name ||
                                                        "Unknown"}
                                                </h3>

                                                <span
                                                    className="
                                                        !rounded-full
                                                        !bg-emerald-400/10
                                                        !px-2
                                                        !py-1
                                                        !text-[10px]
                                                        !font-bold
                                                        !uppercase
                                                        !tracking-wide
                                                        !text-emerald-300
                                                    "
                                                >
                                                    Owner
                                                </span>

                                            </div>

                                            <p
                                                className="
                                                    !mt-1
                                                    !line-clamp-2
                                                    !text-sm
                                                    !leading-5
                                                    !text-slate-400
                                                "
                                            >
                                                {project.owner?.bio ||
                                                    "Project creator"}
                                            </p>

                                            <div
                                                className="
                                                    !mt-3
                                                    !flex
                                                    !flex-wrap
                                                    !gap-2
                                                "
                                            >

                                                {Array.isArray(
                                                    project.owner?.skills
                                                ) &&
                                                    project.owner.skills
                                                        .slice(0, 4)
                                                        .map(
                                                            (skill) => (
                                                                <span
                                                                    key={skill}
                                                                    className="
                                                                        !rounded-full
                                                                        !border
                                                                        !border-white/10
                                                                        !bg-black/20
                                                                        !px-2.5
                                                                        !py-1
                                                                        !text-[10px]
                                                                        !font-medium
                                                                        !text-slate-400
                                                                    "
                                                                >
                                                                    {skill}
                                                                </span>
                                                            )
                                                        )}

                                            </div>

                                        </div>

                                        <span
                                            className="
                                                !hidden
                                                !shrink-0
                                                !text-xs
                                                !font-semibold
                                                !text-emerald-300
                                                sm:!block
                                            "
                                        >
                                            View Profile →
                                        </span>

                                    </div>

                                </Link>


                                {/* MEMBERS */}

                                {Array.isArray(
                                    project.members
                                ) &&
                                project.members.length > 0 ? (

                                    project.members.map(
                                        (member) => {

                                            const memberId =
                                                getUserId(
                                                    member
                                                );

                                            const isBeingRemoved =
                                                removingMemberId ===
                                                memberId;

                                            return (
                                                <div
                                                    key={memberId}
                                                    className="
                                                        !rounded-2xl
                                                        !border
                                                        !border-white/10
                                                        !bg-black/10
                                                        !p-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            !flex
                                                            !flex-col
                                                            !gap-4
                                                            sm:!flex-row
                                                            sm:!items-center
                                                        "
                                                    >

                                                        <Link
                                                            to={
                                                                memberId
                                                                    ? `/profile/${memberId}`
                                                                    : "#"
                                                            }
                                                            state={{
                                                                user: member
                                                            }}
                                                            className="
                                                                !flex
                                                                !min-w-0
                                                                !flex-1
                                                                !items-center
                                                                !gap-4
                                                                !rounded-xl
                                                                !transition
                                                                hover:!opacity-90
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    !h-16
                                                                    !w-16
                                                                    !shrink-0
                                                                    !overflow-hidden
                                                                    !rounded-xl
                                                                    !border
                                                                    !border-white/10
                                                                    !bg-slate-900
                                                                "
                                                            >

                                                                {member?.profileImage ? (

                                                                    <img
                                                                        src={
                                                                            member.profileImage
                                                                        }
                                                                        alt={
                                                                            member.name ||
                                                                            "Member"
                                                                        }
                                                                        className="
                                                                            !h-full
                                                                            !w-full
                                                                            !object-cover
                                                                        "
                                                                    />

                                                                ) : (

                                                                    <div
                                                                        className="
                                                                            !flex
                                                                            !h-full
                                                                            !w-full
                                                                            !items-center
                                                                            !justify-center
                                                                            !bg-slate-800
                                                                            !text-xl
                                                                            !font-bold
                                                                            !text-emerald-300
                                                                        "
                                                                    >
                                                                        {
                                                                            (
                                                                                member?.name ||
                                                                                "M"
                                                                            )
                                                                                .charAt(0)
                                                                                .toUpperCase()
                                                                        }
                                                                    </div>

                                                                )}

                                                            </div>


                                                            <div
                                                                className="
                                                                    !min-w-0
                                                                    !flex-1
                                                                "
                                                            >

                                                                <div
                                                                    className="
                                                                        !flex
                                                                        !flex-wrap
                                                                        !items-center
                                                                        !gap-2
                                                                    "
                                                                >

                                                                    <h3
                                                                        className="
                                                                            !m-0
                                                                            !truncate
                                                                            !text-base
                                                                            !font-bold
                                                                            !text-white
                                                                        "
                                                                    >
                                                                        {member?.name ||
                                                                            "Unknown member"}
                                                                    </h3>

                                                                    <span
                                                                        className="
                                                                            !text-xs
                                                                            !font-medium
                                                                            !text-slate-500
                                                                        "
                                                                    >
                                                                        Member
                                                                    </span>

                                                                </div>

                                                                <p
                                                                    className="
                                                                        !mt-1
                                                                        !line-clamp-2
                                                                        !text-sm
                                                                        !leading-5
                                                                        !text-slate-400
                                                                    "
                                                                >
                                                                    {member?.bio ||
                                                                        member?.course ||
                                                                        "Project team member"}
                                                                </p>

                                                                {Array.isArray(
                                                                    member?.skills
                                                                ) && (
                                                                    <div
                                                                        className="
                                                                            !mt-3
                                                                            !flex
                                                                            !flex-wrap
                                                                            !gap-2
                                                                        "
                                                                    >

                                                                        {member.skills
                                                                            .slice(
                                                                                0,
                                                                                4
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    skill
                                                                                ) => (
                                                                                    <span
                                                                                        key={skill}
                                                                                        className="
                                                                                            !rounded-full
                                                                                            !border
                                                                                            !border-white/10
                                                                                            !bg-black/20
                                                                                            !px-2.5
                                                                                            !py-1
                                                                                            !text-[10px]
                                                                                            !font-medium
                                                                                            !text-slate-400
                                                                                        "
                                                                                    >
                                                                                        {skill}
                                                                                    </span>
                                                                                )
                                                                            )}

                                                                    </div>
                                                                )}

                                                            </div>

                                                            <span
                                                                className="
                                                                    !hidden
                                                                    !shrink-0
                                                                    !text-xs
                                                                    !font-semibold
                                                                    !text-slate-400
                                                                    sm:!block
                                                                "
                                                            >
                                                                Profile →
                                                            </span>

                                                        </Link>


                                                        {isOwner && (

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    isBeingRemoved
                                                                }
                                                                onClick={() =>
                                                                    handleRemoveMember(
                                                                        member
                                                                    )
                                                                }
                                                                className="
                                                                    !min-h-10
                                                                    !rounded-xl
                                                                    !border
                                                                    !border-red-400/40
                                                                    !bg-red-400/5
                                                                    !px-4
                                                                    !py-2.5
                                                                    !text-sm
                                                                    !font-bold
                                                                    !text-red-300
                                                                    !transition
                                                                    hover:!border-red-400
                                                                    hover:!bg-red-400
                                                                    hover:!text-white
                                                                    disabled:!cursor-not-allowed
                                                                    disabled:!opacity-50
                                                                "
                                                            >
                                                                {isBeingRemoved
                                                                    ? "Removing..."
                                                                    : "Remove"}
                                                            </button>

                                                        )}

                                                    </div>

                                                </div>
                                            );

                                        }
                                    )

                                ) : (

                                    <div
                                        className="
                                            !rounded-2xl
                                            !border
                                            !border-dashed
                                            !border-white/10
                                            !bg-black/10
                                            !p-6
                                            !text-center
                                        "
                                    >

                                        <p
                                            className="
                                                !m-0
                                                !text-sm
                                                !text-slate-500
                                            "
                                        >
                                            No other members have joined yet.
                                        </p>

                                    </div>

                                )}

                            </div>

                        </section>

                    </div>


                    {/* SIDEBAR */}

                    <aside
                        className="
                            !space-y-6
                        "
                    >

                        {/* OWNER PROFILE */}

                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-6
                            "
                        >

                            <p
                                className="
                                    !mb-1
                                    !font-mono
                                    !text-[11px]
                                    !font-semibold
                                    !uppercase
                                    !tracking-widest
                                    !text-slate-500
                                "
                            >
                                Project Owner
                            </p>

                            <Link
                                to={
                                    ownerId &&
                                    ownerId === currentUserId
                                        ? "/profile"
                                        : ownerId
                                            ? `/profile/${ownerId}`
                                            : "#"
                                }
                                state={
                                    ownerId &&
                                    ownerId === currentUserId
                                        ? undefined
                                        : {
                                            user: project.owner
                                        }
                                }
                                className="
                                    !mt-4
                                    !block
                                    !rounded-2xl
                                    !border
                                    !border-white/10
                                    !bg-black/10
                                    !p-4
                                    !text-center
                                    !transition
                                    hover:!border-emerald-400/30
                                    hover:!bg-emerald-400/[0.04]
                                "
                            >

                                <div
                                    className="
                                        !mx-auto
                                        !h-28
                                        !w-28
                                        !overflow-hidden
                                        !rounded-2xl
                                        !border
                                        !border-emerald-400/30
                                        !bg-slate-900
                                        sm:!h-32
                                        sm:!w-32
                                    "
                                >

                                    {project.owner?.profileImage ? (

                                        <img
                                            src={
                                                project.owner
                                                    .profileImage
                                            }
                                            alt={
                                                project.owner?.name ||
                                                "Owner"
                                            }
                                            className="
                                                !h-full
                                                !w-full
                                                !object-cover
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                !flex
                                                !h-full
                                                !w-full
                                                !items-center
                                                !justify-center
                                                !bg-emerald-400/10
                                                !text-4xl
                                                !font-bold
                                                !text-emerald-300
                                            "
                                        >
                                            {
                                                (
                                                    project.owner?.name ||
                                                    "O"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()
                                            }
                                        </div>

                                    )}

                                </div>


                                <h3
                                    className="
                                        !mt-4
                                        !mb-0
                                        !text-lg
                                        !font-bold
                                    "
                                >
                                    {project.owner?.name ||
                                        "Unknown"}
                                </h3>


                                {project.owner?.location && (

                                    <p
                                        className="
                                            !mt-1
                                            !mb-0
                                            !text-xs
                                            !text-slate-500
                                        "
                                    >
                                        📍 {project.owner.location}
                                    </p>

                                )}


                                <span
                                    className="
                                        !mt-4
                                        !inline-flex
                                        !rounded-full
                                        !border
                                        !border-emerald-400/20
                                        !bg-emerald-400/10
                                        !px-3
                                        !py-1.5
                                        !text-xs
                                        !font-semibold
                                        !text-emerald-300
                                    "
                                >
                                    View Full Profile
                                </span>

                            </Link>

                        </section>


                        {/* TEAM SUMMARY */}

                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-6
                            "
                        >

                            <p
                                className="
                                    !mb-1
                                    !font-mono
                                    !text-[11px]
                                    !font-semibold
                                    !uppercase
                                    !tracking-widest
                                    !text-slate-500
                                "
                            >
                                Team Summary
                            </p>

                            <div
                                className="
                                    !mt-5
                                    !grid
                                    !grid-cols-2
                                    !gap-3
                                "
                            >

                                <div
                                    className="
                                        !rounded-xl
                                        !border
                                        !border-white/10
                                        !bg-black/10
                                        !p-4
                                    "
                                >

                                    <p
                                        className="
                                            !m-0
                                            !text-xs
                                            !text-slate-500
                                        "
                                    >
                                        Filled
                                    </p>

                                    <p
                                        className="
                                            !mt-2
                                            !mb-0
                                            !text-xl
                                            !font-extrabold
                                            !text-white
                                        "
                                    >
                                        {currentMembers}
                                    </p>

                                </div>


                                <div
                                    className="
                                        !rounded-xl
                                        !border
                                        !border-white/10
                                        !bg-black/10
                                        !p-4
                                    "
                                >

                                    <p
                                        className="
                                            !m-0
                                            !text-xs
                                            !text-slate-500
                                        "
                                    >
                                        Capacity
                                    </p>

                                    <p
                                        className="
                                            !mt-2
                                            !mb-0
                                            !text-xl
                                            !font-extrabold
                                            !text-white
                                        "
                                    >
                                        {memberLimit}
                                    </p>

                                </div>

                            </div>


                            <div
                                className="
                                    !mt-4
                                    !h-2
                                    !overflow-hidden
                                    !rounded-full
                                    !bg-slate-800
                                "
                            >

                                <div
                                    className="
                                        !h-full
                                        !rounded-full
                                        !bg-emerald-400
                                    "
                                    style={{
                                        width:
                                            memberLimit > 0
                                                ?
                                                `${Math.min(
                                                    100,
                                                    (
                                                        currentMembers /
                                                        memberLimit
                                                    ) *
                                                        100
                                                )}%`
                                                :
                                                "0%"
                                    }}
                                />

                            </div>

                        </section>


                        {/* PROJECT METADATA */}

                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-6
                            "
                        >

                            <div
                                className="
                                    !space-y-4
                                "
                            >

                                {[
                                    [
                                        "Stage",
                                        stageLabel(
                                            project.stage
                                        )
                                    ],
                                    [
                                        "Commitment",
                                        commitmentLabel(
                                            project.commitment
                                        )
                                    ],
                                    [
                                        "Mode",
                                        modeLabel(
                                            project.collaborationMode
                                        )
                                    ],
                                    [
                                        "Deadline",
                                        formatDate(
                                            project.deadline
                                        )
                                    ]
                                ].map(
                                    (
                                        [
                                            label,
                                            value
                                        ]
                                    ) => (

                                        <div
                                            key={label}
                                            className="
                                                !border-b
                                                !border-white/10
                                                !pb-4
                                                last:!border-0
                                                last:!pb-0
                                            "
                                        >

                                            <p
                                                className="
                                                    !m-0
                                                    !text-[11px]
                                                    !font-mono
                                                    !font-semibold
                                                    !uppercase
                                                    !tracking-widest
                                                    !text-slate-500
                                                "
                                            >
                                                {label}
                                            </p>

                                            <p
                                                className="
                                                    !mt-1.5
                                                    !mb-0
                                                    !text-sm
                                                    !font-semibold
                                                    !text-slate-200
                                                "
                                            >
                                                {value}
                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        </section>

                    </aside>

                </div>

            </div>

        </main>

    );

};

export default ProjectDetailsPage;