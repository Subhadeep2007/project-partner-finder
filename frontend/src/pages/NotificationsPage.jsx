import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from "../services/notification.service";


const NotificationsPage = () => {

    const navigate =
        useNavigate();


    const [
        notifications,
        setNotifications
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);


    const [
        markingAll,
        setMarkingAll
    ] = useState(false);


    const [
        processingId,
        setProcessingId
    ] = useState(null);


    // ==========================================
    // FETCH NOTIFICATIONS
    // ==========================================

    useEffect(() => {

        const fetchNotifications =
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const response =
                        await getMyNotifications();


                    setNotifications(
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : []
                    );


                    setUnreadCount(
                        Number(
                            response.unreadCount || 0
                        )
                    );

                } catch (error) {

                    let errorMessage =
                        "Failed to load notifications";


                    if (
                        error &&
                        error.response &&
                        error.response.data &&
                        error.response.data.message
                    ) {

                        errorMessage =
                            error.response.data.message;

                    }


                    setError(
                        errorMessage
                    );

                } finally {

                    setLoading(false);

                }

            };


        fetchNotifications();

    }, []);


    // ==========================================
    // MARK SINGLE NOTIFICATION AS READ
    // ==========================================

    const handleNotificationClick =
        async (
            notification
        ) => {

            try {

                setError("");


                if (
                    !notification.isRead
                ) {

                    setProcessingId(
                        notification._id
                    );


                    await markNotificationAsRead(
                        notification._id
                    );


                    setNotifications(
                        (
                            previousNotifications
                        ) =>

                            previousNotifications.map(
                                (
                                    item
                                ) => {

                                    if (
                                        item._id ===
                                        notification._id
                                    ) {

                                        return {
                                            ...item,
                                            isRead:
                                                true
                                        };

                                    }


                                    return item;

                                }
                            )

                    );


                    setUnreadCount(
                        (
                            previousCount
                        ) =>

                            Math.max(
                                previousCount - 1,
                                0
                            )

                    );

                }


                if (
                    notification.project &&
                    notification.project._id
                ) {

                    if (
                        notification.type ===
                        "come_online_request"
                    ) {

                        navigate(
                            `/projects/${notification.project._id}/chat`
                        );

                    } else {

                        navigate(
                            `/projects/${notification.project._id}`
                        );

                    }

                }

            } catch (error) {

                let errorMessage =
                    "Failed to update notification";


                if (
                    error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    errorMessage =
                        error.response.data.message;

                }


                setError(
                    errorMessage
                );

            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    const handleMarkAllAsRead =
        async () => {

            try {

                setMarkingAll(
                    true
                );

                setError("");


                await markAllNotificationsAsRead();


                setNotifications(
                    (
                        previousNotifications
                    ) =>

                        previousNotifications.map(
                            (
                                notification
                            ) => ({
                                ...notification,
                                isRead:
                                    true
                            })
                        )

                );


                setUnreadCount(
                    0
                );

            } catch (error) {

                let errorMessage =
                    "Failed to mark notifications as read";


                if (
                    error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    errorMessage =
                        error.response.data.message;

                }


                setError(
                    errorMessage
                );

            } finally {

                setMarkingAll(
                    false
                );

            }

        };


    // ==========================================
    // DELETE NOTIFICATION
    // ==========================================

    const handleDeleteNotification =
        async (
            notificationId
        ) => {

            try {

                setProcessingId(
                    notificationId
                );

                setError("");


                const notification =
                    notifications.find(
                        (
                            item
                        ) =>
                            item._id ===
                            notificationId
                    );


                await deleteNotification(
                    notificationId
                );


                setNotifications(
                    (
                        previousNotifications
                    ) =>

                        previousNotifications.filter(
                            (
                                item
                            ) =>
                                item._id !==
                                notificationId
                        )

                );


                if (
                    notification &&
                    !notification.isRead
                ) {

                    setUnreadCount(
                        (
                            previousCount
                        ) =>

                            Math.max(
                                previousCount - 1,
                                0
                            )

                    );

                }

            } catch (error) {

                let errorMessage =
                    "Failed to delete notification";


                if (
                    error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    errorMessage =
                        error.response.data.message;

                }


                setError(
                    errorMessage
                );

            } finally {

                setProcessingId(
                    null
                );

            }

        };


    // ==========================================
    // GET NOTIFICATION ICON
    // ==========================================

    const getNotificationIcon =
        (
            type
        ) => {

            if (
                type ===
                "join_request"
            ) {

                return "🤝";

            }


            if (
                type ===
                "join_accepted"
            ) {

                return "✅";

            }


            if (
                type ===
                "join_rejected"
            ) {

                return "❌";

            }


            if (
                type ===
                "member_joined"
            ) {

                return "👋";

            }


            if (
                type ===
                "member_left"
            ) {

                return "🚪";

            }


            if (
                type ===
                "member_removed"
            ) {

                return "🗑️";

            }


            if (
                type ===
                "new_message"
            ) {

                return "💬";

            }


            if (
                type ===
                "come_online_request"
            ) {

                return "📣";

            }


            return "🔔";

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
                    !px-3
                    !py-6
                    !text-white
                    sm:!px-6
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

                    <div
                        className="
                            !animate-pulse
                            !space-y-4
                        "
                    >

                        <div
                            className="
                                !h-4
                                !w-36
                                !rounded
                                !bg-slate-800
                            "
                        />


                        <div
                            className="
                                !h-10
                                !w-64
                                !rounded-xl
                                !bg-slate-800
                            "
                        />


                        <div
                            className="
                                !h-20
                                !w-full
                                !rounded-2xl
                                !bg-slate-900
                            "
                        />


                        <div
                            className="
                                !h-32
                                !w-full
                                !rounded-2xl
                                !bg-slate-900
                            "
                        />


                        <div
                            className="
                                !h-32
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
    // PAGE
    // ==========================================

    return (

        <main
            className="
                !min-h-screen
                !w-full
                !bg-[#070b0f]
                !px-3
                !py-6
                !text-white
                sm:!px-6
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
                        !bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_35%),#0d151d]
                        !p-5
                        !shadow-2xl
                        !shadow-black/20
                        sm:!p-7
                    "
                >

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

                            <p
                                className="
                                    !mb-2
                                    !font-mono
                                    !text-xs
                                    !font-bold
                                    !uppercase
                                    !tracking-[0.2em]
                                    !text-emerald-400
                                "
                            >
                                ~/notifications
                            </p>


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
                                Notifications
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
                                Stay updated with your
                                projects and team activity.
                            </p>

                        </div>


                        <div
                            className="
                                !flex
                                !flex-wrap
                                !items-center
                                !gap-3
                            "
                        >

                            <div
                                className="
                                    !flex
                                    !items-center
                                    !gap-2
                                    !rounded-full
                                    !border
                                    !border-emerald-400/20
                                    !bg-emerald-400/10
                                    !px-4
                                    !py-2
                                "
                            >

                                <span
                                    className="
                                        !text-xs
                                        !font-bold
                                        !uppercase
                                        !tracking-wider
                                        !text-emerald-300
                                    "
                                >
                                    Unread
                                </span>


                                <span
                                    className="
                                        !text-sm
                                        !font-extrabold
                                        !text-white
                                    "
                                >
                                    {unreadCount}
                                </span>

                            </div>


                            {unreadCount > 0 && (

                                <button
                                    type="button"
                                    onClick={
                                        handleMarkAllAsRead
                                    }
                                    disabled={
                                        markingAll
                                    }
                                    className="
                                        !min-h-10
                                        !rounded-xl
                                        !border
                                        !border-white/10
                                        !bg-white/[0.03]
                                        !px-4
                                        !py-2
                                        !text-sm
                                        !font-bold
                                        !text-slate-200
                                        !transition
                                        hover:!border-emerald-400/30
                                        hover:!bg-emerald-400/10
                                        hover:!text-emerald-300
                                        disabled:!cursor-not-allowed
                                        disabled:!opacity-50
                                    "
                                >
                                    {markingAll
                                        ? "Updating..."
                                        : "Mark all as read"}
                                </button>

                            )}

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

                {notifications.length === 0 && (

                    <div
                        className="
                            !mt-6
                            !rounded-3xl
                            !border
                            !border-dashed
                            !border-white/10
                            !bg-[#0d151d]
                            !px-6
                            !py-14
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
                            🔔
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
                            No notifications yet
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
                            Join requests, project updates,
                            and messages will appear here.
                        </p>


                        <Link
                            to="/projects"
                            className="
                                !mt-6
                                !inline-flex
                                !min-h-11
                                !items-center
                                !justify-center
                                !rounded-xl
                                !bg-emerald-400
                                !px-5
                                !py-2.5
                                !text-sm
                                !font-bold
                                !text-black
                                !transition
                                hover:!bg-emerald-300
                            "
                        >
                            Explore Projects
                        </Link>

                    </div>

                )}


                {/* ==========================================
                    NOTIFICATION LIST
                ========================================== */}

                {notifications.length > 0 && (

                    <div
                        className="
                            !mt-6
                            !space-y-3
                        "
                    >

                        {notifications.map(
                            (
                                notification
                            ) => {

                                const isProcessing =
                                    processingId ===
                                    notification._id;


                                const sender =
                                    notification.sender;


                                const project =
                                    notification.project;


                                return (

                                    <article
                                        key={
                                            notification._id
                                        }
                                        className={`
                                            !relative
                                            !rounded-2xl
                                            !border
                                            !p-4
                                            !transition
                                            sm:!p-5
                                            ${
                                                notification.isRead
                                                    ? "!border-white/10 !bg-[#0d151d]"
                                                    : "!border-emerald-400/20 !bg-emerald-400/[0.045]"
                                            }
                                        `}
                                    >

                                        <div
                                            className="
                                                !flex
                                                !flex-col
                                                !gap-4
                                                sm:!flex-row
                                            "
                                        >

                                            {/* ==================================
                                                ICON / AVATAR
                                            ================================== */}

                                            <div
                                                className="
                                                    !flex
                                                    !items-start
                                                    !gap-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        !flex
                                                        !h-12
                                                        !w-12
                                                        !shrink-0
                                                        !items-center
                                                        !justify-center
                                                        !overflow-hidden
                                                        !rounded-2xl
                                                        !border
                                                        !border-white/10
                                                        !bg-slate-900
                                                    "
                                                >

                                                    {sender &&
                                                    sender.profileImage ? (

                                                        <img
                                                            src={
                                                                sender.profileImage
                                                            }
                                                            alt={
                                                                sender.name ||
                                                                "User"
                                                            }
                                                            className="
                                                                !h-full
                                                                !w-full
                                                                !object-cover
                                                            "
                                                        />

                                                    ) : (

                                                        <span
                                                            className="
                                                                !text-lg
                                                            "
                                                        >
                                                            {
                                                                getNotificationIcon(
                                                                    notification.type
                                                                )
                                                            }
                                                        </span>

                                                    )}

                                                </div>


                                                <div
                                                    className="
                                                        !min-w-0
                                                        sm:!hidden
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            !flex
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
                                                            {
                                                                notification.title
                                                            }
                                                        </h3>


                                                        {!notification.isRead && (

                                                            <span
                                                                className="
                                                                    !shrink-0
                                                                    !rounded-full
                                                                    !bg-emerald-400
                                                                    !px-2
                                                                    !py-0.5
                                                                    !text-[9px]
                                                                    !font-extrabold
                                                                    !tracking-wider
                                                                    !text-black
                                                                "
                                                            >
                                                                NEW
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>


                                            {/* ==================================
                                                CONTENT
                                            ================================== */}

                                            <div
                                                className="
                                                    !min-w-0
                                                    !flex-1
                                                "
                                            >

                                                <div
                                                    className="
                                                        !hidden
                                                        !items-start
                                                        !justify-between
                                                        !gap-4
                                                        sm:!flex
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            !min-w-0
                                                        "
                                                    >

                                                        <h3
                                                            className="
                                                                !m-0
                                                                !text-base
                                                                !font-bold
                                                                !text-white
                                                            "
                                                        >
                                                            {
                                                                notification.title
                                                            }
                                                        </h3>


                                                        <p
                                                            className="
                                                                !mt-2
                                                                !mb-0
                                                                !text-sm
                                                                !leading-6
                                                                !text-slate-400
                                                            "
                                                        >
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                    </div>


                                                    {!notification.isRead && (

                                                        <span
                                                            className="
                                                                !shrink-0
                                                                !rounded-full
                                                                !bg-emerald-400
                                                                !px-2.5
                                                                !py-1
                                                                !text-[9px]
                                                                !font-extrabold
                                                                !tracking-wider
                                                                !text-black
                                                            "
                                                        >
                                                            NEW
                                                        </span>

                                                    )}

                                                </div>


                                                <div
                                                    className="
                                                        !sm:hidden
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            !mt-2
                                                            !mb-0
                                                            !text-sm
                                                            !leading-6
                                                            !text-slate-400
                                                        "
                                                    >
                                                        {
                                                            notification.message
                                                        }
                                                    </p>

                                                </div>


                                                {/* SENDER */}

                                                {sender && (

                                                    <div
                                                        className="
                                                            !mt-4
                                                            !rounded-xl
                                                            !border
                                                            !border-white/10
                                                            !bg-black/10
                                                            !p-3
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

                                                            <span
                                                                className="
                                                                    !text-xs
                                                                    !font-bold
                                                                    !uppercase
                                                                    !tracking-wider
                                                                    !text-slate-500
                                                                "
                                                            >
                                                                From
                                                            </span>


                                                            <span
                                                                className="
                                                                    !text-sm
                                                                    !font-bold
                                                                    !text-white
                                                                "
                                                            >
                                                                {
                                                                    sender.name ||
                                                                    "Unknown User"
                                                                }
                                                            </span>

                                                        </div>


                                                        {Array.isArray(
                                                            sender.skills
                                                        ) &&
                                                        sender.skills.length > 0 && (

                                                            <div
                                                                className="
                                                                    !mt-2
                                                                    !flex
                                                                    !flex-wrap
                                                                    !gap-1.5
                                                                "
                                                            >

                                                                {sender.skills
                                                                    .slice(
                                                                        0,
                                                                        5
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

                                                )}


                                                {/* PROJECT */}

                                                {project && (

                                                    <div
                                                        className="
                                                            !mt-3
                                                            !rounded-xl
                                                            !border
                                                            !border-white/10
                                                            !bg-black/10
                                                            !p-3
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                !mb-1
                                                                !text-[10px]
                                                                !font-bold
                                                                !uppercase
                                                                !tracking-[0.18em]
                                                                !text-slate-500
                                                            "
                                                        >
                                                            Project
                                                        </p>


                                                        <p
                                                            className="
                                                                !m-0
                                                                !truncate
                                                                !text-sm
                                                                !font-bold
                                                                !text-white
                                                            "
                                                        >
                                                            {
                                                                project.title
                                                            }
                                                        </p>

                                                    </div>

                                                )}


                                                {/* FOOTER */}

                                                <div
                                                    className="
                                                        !mt-4
                                                        !flex
                                                        !flex-col
                                                        !gap-3
                                                        sm:!flex-row
                                                        sm:!items-center
                                                        sm:!justify-between
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            !text-xs
                                                            !text-slate-600
                                                        "
                                                    >
                                                        {
                                                            new Date(
                                                                notification.createdAt
                                                            ).toLocaleString()
                                                        }
                                                    </span>


                                                    {project &&
                                                    project._id && (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification
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
                                                                !border-emerald-400/30
                                                                !bg-emerald-400/5
                                                                !px-4
                                                                !py-2
                                                                !text-xs
                                                                !font-bold
                                                                !text-emerald-300
                                                                !transition
                                                                hover:!border-emerald-400/60
                                                                hover:!bg-emerald-400/10
                                                                disabled:!cursor-not-allowed
                                                                disabled:!opacity-50
                                                            "
                                                        >
                                                            {
                                                                notification.type ===
                                                                "come_online_request"
                                                                    ? "Open Project Chat →"
                                                                    : "View Project →"
                                                            }
                                                        </button>

                                                    )}

                                                </div>

                                            </div>


                                            {/* ==================================
                                                DELETE BUTTON
                                            ================================== */}

                                            <div
                                                className="
                                                    !flex
                                                    !shrink-0
                                                    !items-start
                                                    !justify-end
                                                    sm:!pt-0
                                                "
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteNotification(
                                                            notification._id
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
                                                        !px-3.5
                                                        !py-2
                                                        !text-xs
                                                        !font-bold
                                                        !text-red-300
                                                        !transition
                                                        hover:!border-red-400/60
                                                        hover:!bg-red-400/10
                                                        disabled:!cursor-not-allowed
                                                        disabled:!opacity-50
                                                    "
                                                >

                                                    {isProcessing
                                                        ? "..."
                                                        : "🗑 Delete"}

                                                </button>

                                            </div>

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </div>

                )}

            </div>

        </main>

    );

};


export default NotificationsPage;