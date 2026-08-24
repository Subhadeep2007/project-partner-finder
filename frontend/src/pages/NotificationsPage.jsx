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
    markAllNotificationsAsRead
} from "../services/notification.service";


const NotificationsPage = () => {

    const navigate = useNavigate();

    const [notifications, setNotifications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [markingAll, setMarkingAll] =
        useState(false);

    const [processingId, setProcessingId] =
        useState(null);


    useEffect(() => {

        const fetchNotifications = async() => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getMyNotifications();

                setNotifications(
                    response.data || []
                );

                setUnreadCount(
                    response.unreadCount || 0
                );

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load notifications"
                );

            } finally {

                setLoading(false);

            }

        };


        fetchNotifications();

    }, []);


    const handleNotificationClick = async(
        notification
    ) => {

        try {

            if (!notification.isRead) {

                setProcessingId(
                    notification._id
                );

                await markNotificationAsRead(
                    notification._id
                );


                setNotifications(
                    (previousNotifications) =>
                        previousNotifications.map(
                            (item) =>
                                item._id ===
                                notification._id
                                    ? {
                                        ...item,
                                        isRead: true
                                    }
                                    : item
                        )
                );


                setUnreadCount(
                    (previousCount) =>
                        Math.max(
                            previousCount - 1,
                            0
                        )
                );

            }


            if (notification.project?._id) {

                navigate(
                    `/projects/${notification.project._id}`
                );

            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to update notification"
            );

        } finally {

            setProcessingId(null);

        }

    };


    const handleMarkAllAsRead = async() => {

        try {

            setMarkingAll(true);
            setError("");

            await markAllNotificationsAsRead();


            setNotifications(
                (previousNotifications) =>
                    previousNotifications.map(
                        (notification) => ({
                            ...notification,
                            isRead: true
                        })
                    )
            );


            setUnreadCount(0);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to mark notifications as read"
            );

        } finally {

            setMarkingAll(false);

        }

    };


    if (loading) {

        return (
            <div className="notifications__state">

                Loading notifications...

            </div>
        );

    }


    return (

        <section className="notifications">


            <div className="notifications__header">

                <div>

                    <p className="notifications__terminal">
                        ~/notifications
                    </p>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Stay updated with your
                        projects and team activity.
                    </p>

                </div>


                <div className="notifications__header-actions">

                    <div className="notifications__count">

                        {unreadCount}

                    </div>


                    {unreadCount > 0 && (

                        <button
                            type="button"
                            className="notifications__read-all"
                            onClick={
                                handleMarkAllAsRead
                            }
                            disabled={markingAll}
                        >

                            {markingAll
                                ? "Updating..."
                                : "Mark all as read"}

                        </button>

                    )}

                </div>

            </div>


            {error && (

                <div className="notifications__error">

                    {error}

                </div>

            )}


            {notifications.length === 0 ? (

                <div className="notifications__empty">

                    <h2>
                        No notifications yet
                    </h2>

                    <p>
                        Join requests, project updates,
                        and messages will appear here.
                    </p>

                    <Link
                        to="/projects"
                        className="notifications__explore"
                    >

                        Explore Projects

                    </Link>

                </div>

            ) : (

                <div className="notifications__list">

                    {notifications.map(
                        (notification) => (

                            <button
                                key={notification._id}
                                type="button"
                                className={
                                    `notification-card ${
                                        !notification.isRead
                                            ? "notification-card--unread"
                                            : ""
                                    }`
                                }
                                onClick={() =>
                                    handleNotificationClick(
                                        notification
                                    )
                                }
                                disabled={
                                    processingId ===
                                    notification._id
                                }
                            >


                                <div className="notification-card__avatar">

                                    {notification.sender
                                        ?.profileImage ? (

                                        <img
                                            src={
                                                notification.sender
                                                    .profileImage
                                            }
                                            alt={
                                                notification.sender
                                                    .name
                                            }
                                        />

                                    ) : (

                                        <span>

                                            {notification.sender
                                                ?.name
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                                "N"}

                                        </span>

                                    )}

                                </div>


                                <div className="notification-card__content">


                                    <div className="notification-card__top">

                                        <div>

                                            <h3>

                                                {notification.title}

                                            </h3>

                                            <p>

                                                {notification.message}

                                            </p>

                                        </div>


                                        {!notification.isRead && (

                                            <span className="notification-card__unread">

                                                NEW

                                            </span>

                                        )}

                                    </div>


                                    {notification.sender && (

                                        <div className="notification-card__sender">

                                            <strong>

                                                {
                                                    notification.sender
                                                        .name
                                                }

                                            </strong>


                                            {notification.sender
                                                .skills?.length > 0 && (

                                                <div className="notification-card__skills">

                                                    {notification.sender
                                                        .skills
                                                        .slice(0, 4)
                                                        .map(
                                                            (skill) => (

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

                                    )}


                                    {notification.project && (

                                        <div className="notification-card__project">

                                            <span>
                                                PROJECT
                                            </span>

                                            <strong>

                                                {
                                                    notification.project
                                                        .title
                                                }

                                            </strong>

                                        </div>

                                    )}


                                    <div className="notification-card__footer">

                                        <span>

                                            {new Date(
                                                notification.createdAt
                                            ).toLocaleString()}

                                        </span>


                                        {notification.project?._id && (

                                            <span className="notification-card__view">

                                                View Project →

                                            </span>

                                        )}

                                    </div>

                                </div>

                            </button>

                        )
                    )}

                </div>

            )}

        </section>

    );

};


export default NotificationsPage;