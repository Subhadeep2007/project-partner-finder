import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useLocation
} from "react-router-dom";

import {
    getMyNotifications
} from "../../services/notification.service";

import {
    socket,
    connectSocket
} from "../../socket/socket";


const Navbar = () => {

    const location =
        useLocation();


    const [unreadCount, setUnreadCount] =
        useState(0);


    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // LOAD UNREAD COUNT
    // ==========================================

    const fetchUnreadCount =
        async() => {

            try {

                const response =
                    await getMyNotifications(
                        1,
                        1
                    );


                setUnreadCount(
                    Number(
                        response.unreadCount || 0
                    )
                );

            } catch (error) {

                console.error(
                    "Failed to load notification count:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {

        fetchUnreadCount();

    }, [location.pathname]);


    // ==========================================
    // REAL-TIME NOTIFICATION
    // ==========================================

    useEffect(() => {

        connectSocket();


        const handleNewNotification =
            () => {

                setUnreadCount(
                    (previousCount) =>
                        previousCount + 1
                );

            };


        const handleNotificationRead =
            () => {

                fetchUnreadCount();

            };


        socket.on(
            "new_notification",
            handleNewNotification
        );


        socket.on(
            "notification_read",
            handleNotificationRead
        );


        return () => {

            socket.off(
                "new_notification",
                handleNewNotification
            );


            socket.off(
                "notification_read",
                handleNotificationRead
            );

        };

    }, []);


    return (

        <header
            className="
                !sticky
                !top-0
                !z-50
                !border-b
                !border-white/10
                !bg-[#080d12]/90
                !px-4
                !py-3
                !backdrop-blur-xl
                sm:!px-6
                lg:!px-8
            "
        >

            <div
                className="
                    !mx-auto
                    !flex
                    !w-full
                    !max-w-7xl
                    !items-center
                    !justify-between
                "
            >

                {/* BRAND */}

                <Link
                    to="/dashboard"
                    className="
                        !no-underline
                    "
                >

                    <div>

                        <p
                            className="
                                !m-0
                                !font-mono
                                !text-[10px]
                                !font-bold
                                !uppercase
                                !tracking-[0.22em]
                                !text-emerald-400
                            "
                        >
                            PROJECT_PARTNER
                        </p>


                        <p
                            className="
                                !m-0
                                !text-lg
                                !font-black
                                !tracking-tight
                                !text-white
                            "
                        >
                            FINDER
                        </p>

                    </div>

                </Link>


                {/* RIGHT SIDE */}

                <div
                    className="
                        !flex
                        !items-center
                        !gap-3
                    "
                >

                    {/* NOTIFICATION */}

                    <Link
                        to="/notifications"
                        aria-label="Notifications"
                        className="
                            !relative
                            !flex
                            !h-11
                            !w-11
                            !items-center
                            !justify-center
                            !rounded-xl
                            !border
                            !border-white/10
                            !bg-white/[0.03]
                            !text-lg
                            !text-slate-300
                            !no-underline
                            !transition
                            hover:!border-emerald-400/30
                            hover:!bg-emerald-400/10
                            hover:!text-emerald-300
                        "
                    >

                        🔔


                        {/* COUNT */}

                        {unreadCount > 0 && (

                            <span
                                className="
                                    !absolute
                                    !-right-1.5
                                    !-top-1.5
                                    !flex
                                    !min-h-5
                                    !min-w-5
                                    !items-center
                                    !justify-center
                                    !rounded-full
                                    !border-2
                                    !border-[#080d12]
                                    !bg-emerald-400
                                    !px-1
                                    !text-[9px]
                                    !font-black
                                    !leading-none
                                    !text-black
                                "
                            >

                                {unreadCount > 99
                                    ? "99+"
                                    : unreadCount
                                }

                            </span>

                        )}

                    </Link>

                </div>

            </div>

        </header>

    );

};


export default Navbar;