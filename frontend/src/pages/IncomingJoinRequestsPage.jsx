import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    acceptJoinRequest,
    getIncomingJoinRequests,
    rejectJoinRequest
} from "../services/joinRequest.service";


const IncomingJoinRequestsPage = () => {

    const [requests, setRequests] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const [processingId, setProcessingId] =
        useState(null);


    const [searchText, setSearchText] =
        useState("");


    const [openProjects, setOpenProjects] =
        useState({});


    // ==========================================
    // FETCH REQUESTS
    // ==========================================

    useEffect(() => {

        const fetchRequests =
            async () => {

                try {

                    setLoading(true);
                    setError("");


                    const response =
                        await getIncomingJoinRequests();


                    setRequests(
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : []
                    );


                } catch (error) {

                    let message =
                        "Failed to load join requests";


                    if (
                        error &&
                        error.response &&
                        error.response.data &&
                        error.response.data.message
                    ) {

                        message =
                            error.response.data.message;

                    }


                    setError(
                        message
                    );


                } finally {

                    setLoading(false);

                }

            };


        fetchRequests();

    }, []);


    // ==========================================
    // ACCEPT
    // ==========================================

    const handleAccept =
        async (
            requestId
        ) => {

            try {

                setProcessingId(
                    requestId
                );


                setError("");


                await acceptJoinRequest(
                    requestId
                );


                setRequests(
                    (previousRequests) =>

                        previousRequests.filter(
                            (request) =>
                                request._id !==
                                requestId
                        )

                );


            } catch (error) {

                let message =
                    "Failed to accept join request";


                if (
                    error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    message =
                        error.response.data.message;

                }


                setError(
                    message
                );


            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // REJECT
    // ==========================================

    const handleReject =
        async (
            requestId
        ) => {

            try {

                setProcessingId(
                    requestId
                );


                setError("");


                await rejectJoinRequest(
                    requestId
                );


                setRequests(
                    (previousRequests) =>

                        previousRequests.filter(
                            (request) =>
                                request._id !==
                                requestId
                        )

                );


            } catch (error) {

                let message =
                    "Failed to reject join request";


                if (
                    error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    message =
                        error.response.data.message;

                }


                setError(
                    message
                );


            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // GROUP BY PROJECT
    // ==========================================

    const projectGroups =
        useMemo(
            () => {

                const groups = {};


                requests.forEach(
                    (request) => {

                        const project =
                            request.project ||
                            {};

                        const projectId =
                            project._id
                                ? project._id.toString()
                                : "unknown-project";


                        if (!groups[projectId]) {

                            groups[projectId] = {

                                projectId,

                                projectTitle:
                                    project.title ||
                                    "Unknown Project",

                                requests: []

                            };

                        }


                        groups[
                            projectId
                        ].requests.push(
                            request
                        );

                    }
                );


                return Object.values(
                    groups
                );

            },
            [
                requests
            ]
        );


    // ==========================================
    // SEARCH
    // ==========================================

    const filteredProjectGroups =
        useMemo(
            () => {

                const search =
                    searchText
                        .trim()
                        .toLowerCase();


                if (!search) {

                    return projectGroups;

                }


                return projectGroups
                    .map(
                        (project) => {

                            const projectMatches =
                                project.projectTitle
                                    .toLowerCase()
                                    .includes(
                                        search
                                    );


                            const matchingRequests =
                                project.requests.filter(
                                    (request) => {

                                        const user =
                                            request.user ||
                                            {};

                                        const userName =
                                            user.name ||
                                            "";

                                        const userEmail =
                                            user.email ||
                                            "";


                                        return (

                                            userName
                                                .toLowerCase()
                                                .includes(
                                                    search
                                                )

                                            ||

                                            userEmail
                                                .toLowerCase()
                                                .includes(
                                                    search
                                                )

                                        );

                                    }
                                );


                            if (
                                projectMatches
                            ) {

                                return project;

                            }


                            return {

                                ...project,

                                requests:
                                    matchingRequests

                            };

                        }
                    )
                    .filter(
                        (project) =>
                            project.requests.length > 0
                    );

            },
            [
                projectGroups,
                searchText
            ]
        );


    // ==========================================
    // AUTO OPEN SEARCH RESULTS
    // ==========================================

    useEffect(() => {

        if (
            !searchText.trim()
        ) {

            return;

        }


        const opened = {};


        filteredProjectGroups.forEach(
            (project) => {

                opened[
                    project.projectId
                ] = true;

            }
        );


        setOpenProjects(
            opened
        );

    }, [
        searchText,
        filteredProjectGroups
    ]);


    // ==========================================
    // TOGGLE PROJECT
    // ==========================================

    const toggleProject =
        (
            projectId
        ) => {

            setOpenProjects(
                (
                    previous
                ) => {

                    const next = {
                        ...previous
                    };


                    if (
                        next[
                            projectId
                        ]
                    ) {

                        delete next[
                            projectId
                        ];

                    } else {

                        next[
                            projectId
                        ] = true;

                    }


                    return next;

                }
            );

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
                    lg:!px-8
                "
            >

                <div
                    className="
                        !mx-auto
                        !w-full
                        !max-w-6xl
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
                                !w-40
                                !rounded
                                !bg-slate-800
                            "
                        />

                        <div
                            className="
                                !h-10
                                !w-80
                                !rounded-lg
                                !bg-slate-800
                            "
                        />

                        <div
                            className="
                                !h-16
                                !w-full
                                !rounded-2xl
                                !bg-slate-900
                            "
                        />

                        <div
                            className="
                                !h-40
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
    // RETURN
    // ==========================================

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
                    !max-w-6xl
                "
            >

                {/* ==========================================
                    HEADER
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
                    "
                >

                    <p
                        className="
                            !mb-2
                            !font-mono
                            !text-xs
                            !font-semibold
                            !uppercase
                            !tracking-widest
                            !text-emerald-400
                        "
                    >
                        ~/projects/requests
                    </p>


                    <div
                        className="
                            !flex
                            !flex-col
                            !gap-5
                            lg:!flex-row
                            lg:!items-end
                            lg:!justify-between
                        "
                    >

                        <div>

                            <h1
                                className="
                                    !m-0
                                    !text-3xl
                                    !font-extrabold
                                    !tracking-tight
                                    !text-white
                                    sm:!text-4xl
                                "
                            >
                                Incoming Join Requests
                            </h1>


                            <p
                                className="
                                    !mt-3
                                    !mb-0
                                    !max-w-2xl
                                    !text-sm
                                    !leading-6
                                    !text-slate-400
                                "
                            >
                                Manage people who want to
                                join your projects.
                            </p>

                        </div>


                        <div
                            className="
                                !rounded-full
                                !border
                                !border-emerald-400/20
                                !bg-emerald-400/10
                                !px-4
                                !py-2
                                !text-sm
                                !font-semibold
                                !text-emerald-300
                            "
                        >
                            {requests.length} pending
                        </div>

                    </div>


                    {/* SEARCH */}

                    <div
                        className="
                            !mt-6
                        "
                    >

                        <div
                            className="
                                !relative
                            "
                        >

                            <span
                                className="
                                    !pointer-events-none
                                    !absolute
                                    !left-4
                                    !top-1/2
                                    !-translate-y-1/2
                                    !text-slate-500
                                "
                            >
                                🔎
                            </span>


                            <input
                                type="text"
                                value={
                                    searchText
                                }
                                onChange={
                                    (event) =>
                                        setSearchText(
                                            event.target.value
                                        )
                                }
                                placeholder="
                                    Search project or user...
                                "
                                className="
                                    !h-12
                                    !w-full
                                    !rounded-xl
                                    !border
                                    !border-white/10
                                    !bg-black/20
                                    !pl-11
                                    !pr-4
                                    !text-sm
                                    !text-white
                                    !outline-none
                                    !transition
                                    placeholder:!text-slate-600
                                    focus:!border-emerald-400/50
                                    focus:!ring-2
                                    focus:!ring-emerald-400/10
                                "
                            />

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    ERROR
                ========================================== */}

                {error && (

                    <div
                        className="
                            !mt-5
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
                    EMPTY
                ========================================== */}

                {filteredProjectGroups.length === 0 && (

                    <div
                        className="
                            !mt-6
                            !rounded-3xl
                            !border
                            !border-dashed
                            !border-white/10
                            !bg-[#0d151d]
                            !p-10
                            !text-center
                        "
                    >

                        <div
                            className="
                                !mx-auto
                                !flex
                                !h-16
                                !w-16
                                !items-center
                                !justify-center
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-black/20
                                !text-2xl
                            "
                        >
                            📭
                        </div>


                        <h2
                            className="
                                !mt-5
                                !mb-0
                                !text-xl
                                !font-bold
                                !text-white
                            "
                        >
                            {searchText.trim()
                                ? "No matching requests"
                                : "No pending join requests"}
                        </h2>


                        <p
                            className="
                                !mx-auto
                                !mt-2
                                !max-w-md
                                !text-sm
                                !leading-6
                                !text-slate-500
                            "
                        >
                            {searchText.trim()
                                ? "Try a different project name or user name."
                                : "New project requests will appear here."}
                        </p>

                    </div>

                )}


                {/* ==========================================
                    PROJECT GROUPS
                ========================================== */}

                <div
                    className="
                        !mt-6
                        !space-y-4
                    "
                >

                    {filteredProjectGroups.map(
                        (project) => {

                            const isOpen =
                                openProjects[
                                    project.projectId
                                ] === true;


                            return (

                                <section
                                    key={
                                        project.projectId
                                    }
                                    className="
                                        !overflow-hidden
                                        !rounded-2xl
                                        !border
                                        !border-white/10
                                        !bg-[#0d151d]
                                    "
                                >

                                    {/* PROJECT HEADER */}

                                    <div
                                        className="
                                            !flex
                                            !flex-col
                                            !gap-4
                                            !p-4
                                            sm:!flex-row
                                            sm:!items-center
                                            sm:!justify-between
                                            sm:!p-5
                                        "
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleProject(
                                                    project.projectId
                                                )
                                            }
                                            className="
                                                !flex
                                                !min-w-0
                                                !flex-1
                                                !items-center
                                                !gap-4
                                                !text-left
                                            "
                                        >

                                            <span
                                                className="
                                                    !flex
                                                    !h-11
                                                    !w-11
                                                    !shrink-0
                                                    !items-center
                                                    !justify-center
                                                    !rounded-xl
                                                    !border
                                                    !border-emerald-400/20
                                                    !bg-emerald-400/10
                                                    !text-lg
                                                "
                                            >
                                                📁
                                            </span>


                                            <span
                                                className="
                                                    !min-w-0
                                                "
                                            >

                                                <span
                                                    className="
                                                        !block
                                                        !truncate
                                                        !text-base
                                                        !font-bold
                                                        !text-white
                                                        sm:!text-lg
                                                    "
                                                >
                                                    {
                                                        project.projectTitle
                                                    }
                                                </span>


                                                <span
                                                    className="
                                                        !mt-1
                                                        !block
                                                        !text-xs
                                                        !text-slate-500
                                                    "
                                                >
                                                    {
                                                        project.requests.length
                                                    }{" "}
                                                    pending request
                                                    {project.requests.length === 1
                                                        ? ""
                                                        : "s"}
                                                </span>

                                            </span>

                                        </button>


                                        <div
                                            className="
                                                !flex
                                                !items-center
                                                !gap-2
                                            "
                                        >

                                            <Link
                                                to={
                                                    `/projects/${project.projectId}`
                                                }
                                                className="
                                                    !rounded-lg
                                                    !border
                                                    !border-white/10
                                                    !bg-white/[0.03]
                                                    !px-3
                                                    !py-2
                                                    !text-xs
                                                    !font-semibold
                                                    !text-slate-300
                                                    !transition
                                                    hover:!border-emerald-400/30
                                                    hover:!text-emerald-300
                                                "
                                            >
                                                Project Details
                                            </Link>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleProject(
                                                        project.projectId
                                                    )
                                                }
                                                className="
                                                    !rounded-lg
                                                    !border
                                                    !border-white/10
                                                    !bg-white/[0.03]
                                                    !px-3
                                                    !py-2
                                                    !text-xs
                                                    !font-bold
                                                    !text-slate-400
                                                "
                                            >
                                                {isOpen
                                                    ? "Hide"
                                                    : "View"}
                                            </button>

                                        </div>

                                    </div>


                                    {/* REQUEST LIST */}

                                    {isOpen && (

                                        <div
                                            className="
                                                !border-t
                                                !border-white/10
                                                !p-3
                                                !sm:p-4
                                            "
                                        >

                                            <div
                                                className="
                                                    !space-y-3
                                                "
                                            >

                                                {project.requests.map(
                                                    (
                                                        request
                                                    ) => {

                                                        const user =
                                                            request.user ||
                                                            {};

                                                        const userId =
                                                            user._id ||
                                                            user.id ||
                                                            user.userId ||
                                                            "";

                                                        const isProcessing =
                                                            processingId ===
                                                            request._id;


                                                        return (

                                                            <article
                                                                key={
                                                                    request._id
                                                                }
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
                                                                        lg:!flex-row
                                                                        lg:!items-center
                                                                        lg:!justify-between
                                                                    "
                                                                >

                                                                    {/* USER */}

                                                                    <div
                                                                        className="
                                                                            !flex
                                                                            !min-w-0
                                                                            !items-center
                                                                            !gap-4
                                                                        "
                                                                    >

                                                                        <div
                                                                            className="
                                                                                !h-16
                                                                                !w-16
                                                                                !shrink-0
                                                                                !overflow-hidden
                                                                                !rounded-2xl
                                                                                !border
                                                                                !border-white/10
                                                                                !bg-slate-900
                                                                            "
                                                                        >

                                                                            {user.profileImage ? (

                                                                                <img
                                                                                    src={
                                                                                        user.profileImage
                                                                                    }
                                                                                    alt={
                                                                                        user.name ||
                                                                                        "User"
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
                                                                                        !text-xl
                                                                                        !font-bold
                                                                                        !text-emerald-300
                                                                                    "
                                                                                >
                                                                                    {
                                                                                        (
                                                                                            user.name ||
                                                                                            "U"
                                                                                        )
                                                                                            .charAt(
                                                                                                0
                                                                                            )
                                                                                            .toUpperCase()
                                                                                    }
                                                                                </div>

                                                                            )}

                                                                        </div>


                                                                        <div
                                                                            className="
                                                                                !min-w-0
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
                                                                                {
                                                                                    user.name ||
                                                                                    "Unknown User"
                                                                                }
                                                                            </h3>


                                                                            <p
                                                                                className="
                                                                                    !mt-1
                                                                                    !mb-0
                                                                                    !text-sm
                                                                                    !text-slate-400
                                                                                "
                                                                            >
                                                                                wants to join
                                                                                this project
                                                                            </p>


                                                                            {user.email && (

                                                                                <p
                                                                                    className="
                                                                                        !mt-1
                                                                                        !mb-0
                                                                                        !truncate
                                                                                        !text-xs
                                                                                        !text-slate-500
                                                                                    "
                                                                                >
                                                                                    {
                                                                                        user.email
                                                                                    }
                                                                                </p>

                                                                            )}


                                                                            {Array.isArray(
                                                                                user.skills
                                                                            ) &&
                                                                            user.skills.length > 0 && (

                                                                                <div
                                                                                    className="
                                                                                        !mt-2
                                                                                        !flex
                                                                                        !flex-wrap
                                                                                        !gap-1.5
                                                                                    "
                                                                                >

                                                                                    {user.skills
                                                                                        .slice(
                                                                                            0,
                                                                                            4
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                skill
                                                                                            ) => (

                                                                                                <span
                                                                                                    key={
                                                                                                        skill
                                                                                                    }
                                                                                                    className="
                                                                                                        !rounded-full
                                                                                                        !border
                                                                                                        !border-emerald-400/20
                                                                                                        !bg-emerald-400/10
                                                                                                        !px-2
                                                                                                        !py-1
                                                                                                        !text-[10px]
                                                                                                        !font-semibold
                                                                                                        !text-emerald-300
                                                                                                    "
                                                                                                >
                                                                                                    {
                                                                                                        skill
                                                                                                    }
                                                                                                </span>

                                                                                            )
                                                                                        )}

                                                                                </div>

                                                                            )}

                                                                        </div>

                                                                    </div>


                                                                    {/* ACTIONS */}

                                                                    <div
                                                                        className="
                                                                            !flex
                                                                            !flex-wrap
                                                                            !gap-2
                                                                            lg:!justify-end
                                                                        "
                                                                    >

                                                                        <Link
                                                                            to={
                                                                                userId
                                                                                    ? `/profile/${userId}`
                                                                                    : "#"
                                                                            }
                                                                            state={{
                                                                                user:
                                                                                    user
                                                                            }}
                                                                            className="
                                                                                !inline-flex
                                                                                !min-h-10
                                                                                !items-center
                                                                                !justify-center
                                                                                !rounded-xl
                                                                                !border
                                                                                !border-cyan-400/30
                                                                                !bg-cyan-400/5
                                                                                !px-4
                                                                                !py-2
                                                                                !text-sm
                                                                                !font-bold
                                                                                !text-cyan-300
                                                                                !transition
                                                                                hover:!border-cyan-400/60
                                                                                hover:!bg-cyan-400/10
                                                                            "
                                                                        >
                                                                            View Profile
                                                                        </Link>


                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleAccept(
                                                                                    request._id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                isProcessing
                                                                            }
                                                                            className="
                                                                                !inline-flex
                                                                                !min-h-10
                                                                                !items-center
                                                                                !justify-center
                                                                                !rounded-xl
                                                                                !border
                                                                                !border-emerald-400/40
                                                                                !bg-emerald-400
                                                                                !px-4
                                                                                !py-2
                                                                                !text-sm
                                                                                !font-bold
                                                                                !text-black
                                                                                !transition
                                                                                hover:!bg-emerald-300
                                                                                disabled:!cursor-not-allowed
                                                                                disabled:!opacity-50
                                                                            "
                                                                        >
                                                                            {isProcessing
                                                                                ? "Processing..."
                                                                                : "Accept"}
                                                                        </button>


                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleReject(
                                                                                    request._id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                isProcessing
                                                                            }
                                                                            className="
                                                                                !inline-flex
                                                                                !min-h-10
                                                                                !items-center
                                                                                !justify-center
                                                                                !rounded-xl
                                                                                !border
                                                                                !border-red-400/30
                                                                                !bg-red-400/5
                                                                                !px-4
                                                                                !py-2
                                                                                !text-sm
                                                                                !font-bold
                                                                                !text-red-300
                                                                                !transition
                                                                                hover:!border-red-400/60
                                                                                hover:!bg-red-400/10
                                                                                disabled:!cursor-not-allowed
                                                                                disabled:!opacity-50
                                                                            "
                                                                        >
                                                                            Reject
                                                                        </button>

                                                                    </div>

                                                                </div>

                                                            </article>

                                                        );

                                                    }
                                                )}

                                            </div>

                                        </div>

                                    )}

                                </section>

                            );

                        }
                    )}

                </div>

            </div>

        </main>

    );

};


export default IncomingJoinRequestsPage;