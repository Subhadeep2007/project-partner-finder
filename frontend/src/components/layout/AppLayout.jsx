import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router-dom";


const AppLayout = () => {

    const navigate =
        useNavigate();


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem(
            "accessToken"
        );

        localStorage.removeItem(
            "user"
        );


        navigate(
            "/login",
            {
                replace: true
            }
        );

    };


    // ==========================================
    // NAV LINK CLASS
    // ==========================================

    const mainNavClass = ({
        isActive
    }) => {

        return `
            !block
            !rounded-xl
            !px-4
            !py-3
            !text-sm
            !font-semibold
            !transition
            ${
                isActive
                    ? "!border !border-emerald-400/20 !bg-emerald-400/10 !text-emerald-300"
                    : "!text-slate-400 hover:!bg-white/[0.03] hover:!text-white"
            }
        `;

    };


    const workspaceNavClass = ({
        isActive
    }) => {

        return `
            !flex
            !items-center
            !gap-3
            !rounded-xl
            !border
            !px-4
            !py-3
            !transition
            ${
                isActive
                    ? "!border-white/10 !bg-white/[0.04] !text-white"
                    : "!border-transparent !text-slate-400 hover:!border-white/5 hover:!bg-white/[0.03] hover:!text-white"
            }
        `;

    };


    return (

        <div
            className="
                !min-h-screen
                !bg-[#070b0f]
                !text-white
                lg:!flex
            "
        >

            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside
                className="
                    !w-full
                    !border-b
                    !border-white/10
                    !bg-[#0b1117]
                    lg:!sticky
                    lg:!top-0
                    lg:!flex
                    lg:!h-screen
                    lg:!w-72
                    lg:!shrink-0
                    lg:!flex-col
                    lg:!overflow-y-auto
                    lg:!border-b-0
                    lg:!border-r
                "
            >

                {/* ======================================
                    LOGO
                ====================================== */}

                <div
                    className="
                        !border-b
                        !border-white/10
                        !px-5
                        !py-5
                        sm:!px-6
                    "
                >

                    <NavLink
                        to="/dashboard"
                        className="
                            !no-underline
                        "
                    >

                        <p
                            className="
                                !m-0
                                !font-mono
                                !text-[10px]
                                !font-bold
                                !uppercase
                                !tracking-[0.3em]
                                !text-slate-500
                            "
                        >
                            PROJECT
                        </p>


                        <div
                            className="
                                !mt-1
                                !text-2xl
                                !font-black
                                !tracking-wide
                                !text-emerald-400
                            "
                        >
                            FINDER
                        </div>

                    </NavLink>

                </div>


                {/* ======================================
                    NAVIGATION
                ====================================== */}

                <nav
                    className="
                        !flex-1
                        !p-4
                    "
                >

                    {/* ==================================
                        MAIN
                    ================================== */}

                    <div
                        className="
                            !mb-7
                        "
                    >

                        <p
                            className="
                                !mb-3
                                !px-3
                                !font-mono
                                !text-[10px]
                                !font-bold
                                !uppercase
                                !tracking-[0.2em]
                                !text-slate-600
                            "
                        >
                            Main
                        </p>


                        <div
                            className="
                                !space-y-1
                            "
                        >

                            {/* DASHBOARD */}

                            <NavLink
                                to="/dashboard"
                                className={
                                    mainNavClass
                                }
                            >

                                <span
                                    className="
                                        !mr-2
                                    "
                                >
                                    ⌂
                                </span>

                                Dashboard

                            </NavLink>


                            {/* PROJECTS */}

                            <NavLink
                                to="/projects"
                                className={
                                    mainNavClass
                                }
                            >

                                <span
                                    className="
                                        !mr-2
                                    "
                                >
                                    ◈
                                </span>

                                Projects

                            </NavLink>


                            {/* NOTIFICATIONS */}

                            <NavLink
                                to="/notifications"
                                className={
                                    mainNavClass
                                }
                            >

                                <span
                                    className="
                                        !mr-2
                                    "
                                >
                                    ◉
                                </span>

                                Notifications

                            </NavLink>


                            {/* PROFILE */}

                            <NavLink
                                to="/profile"
                                className={
                                    mainNavClass
                                }
                            >

                                <span
                                    className="
                                        !mr-2
                                    "
                                >
                                    ◎
                                </span>

                                Profile

                            </NavLink>

                        </div>

                    </div>


                    {/* ==================================
                        WORKSPACE
                    ================================== */}

                    <div>

                        <p
                            className="
                                !mb-3
                                !px-3
                                !font-mono
                                !text-[10px]
                                !font-bold
                                !uppercase
                                !tracking-[0.2em]
                                !text-slate-600
                            "
                        >
                            Workspace
                        </p>


                        <div
                            className="
                                !space-y-2
                            "
                        >

                            {/* VIEW PROJECTS */}

                            <NavLink
                                to="/projects"
                                className={
                                    workspaceNavClass
                                }
                            >

                                <span
                                    className="
                                        !flex
                                        !h-8
                                        !w-8
                                        !shrink-0
                                        !items-center
                                        !justify-center
                                        !rounded-lg
                                        !bg-blue-400/10
                                        !text-sm
                                        !text-blue-300
                                    "
                                >
                                    ◫
                                </span>


                                <span>

                                    <span
                                        className="
                                            !block
                                            !text-sm
                                            !font-semibold
                                        "
                                    >
                                        View Projects
                                    </span>


                                    <span
                                        className="
                                            !mt-0.5
                                            !block
                                            !text-[11px]
                                            !text-slate-600
                                        "
                                    >
                                        Find teammates
                                    </span>

                                </span>

                            </NavLink>


                            {/* INCOMING REQUESTS */}

                            <NavLink
                                to="/join-requests"
                                className={
                                    workspaceNavClass
                                }
                            >

                                <span
                                    className="
                                        !flex
                                        !h-8
                                        !w-8
                                        !shrink-0
                                        !items-center
                                        !justify-center
                                        !rounded-lg
                                        !bg-yellow-400/10
                                        !text-sm
                                        !text-yellow-300
                                    "
                                >
                                    ⇢
                                </span>


                                <span>

                                    <span
                                        className="
                                            !block
                                            !text-sm
                                            !font-semibold
                                        "
                                    >
                                        Incoming Requests
                                    </span>


                                    <span
                                        className="
                                            !mt-0.5
                                            !block
                                            !text-[11px]
                                            !text-slate-600
                                        "
                                    >
                                        Review teammates
                                    </span>

                                </span>

                            </NavLink>


                            {/* CREATE PROJECT */}

                            <NavLink
                                to="/projects/create"
                                className={
                                    workspaceNavClass
                                }
                            >

                                <span
                                    className="
                                        !flex
                                        !h-8
                                        !w-8
                                        !shrink-0
                                        !items-center
                                        !justify-center
                                        !rounded-lg
                                        !bg-emerald-400/10
                                        !text-sm
                                        !text-emerald-300
                                    "
                                >
                                    +
                                </span>


                                <span>

                                    <span
                                        className="
                                            !block
                                            !text-sm
                                            !font-semibold
                                        "
                                    >
                                        Create Project
                                    </span>


                                    <span
                                        className="
                                            !mt-0.5
                                            !block
                                            !text-[11px]
                                            !text-slate-600
                                        "
                                    >
                                        Start something new
                                    </span>

                                </span>

                            </NavLink>

                        </div>

                    </div>

                </nav>


                {/* ======================================
                    LOGOUT
                ====================================== */}

                <div
                    className="
                        !border-t
                        !border-white/10
                        !p-4
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleLogout
                        }
                        className="
                            !flex
                            !min-h-11
                            !w-full
                            !items-center
                            !gap-3
                            !rounded-xl
                            !border
                            !border-red-400/20
                            !bg-red-400/5
                            !px-4
                            !py-3
                            !text-sm
                            !font-semibold
                            !text-red-300
                            !transition
                            hover:!border-red-400/40
                            hover:!bg-red-400/10
                            hover:!text-red-200
                        "
                    >

                        <span
                            className="
                                !text-base
                            "
                        >
                            ⇥
                        </span>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* ==========================================
                MAIN CONTENT
            ========================================== */}

            <main
                className="
                    !min-w-0
                    !flex-1
                "
            >

                <Outlet />

            </main>

        </div>

    );

};


export default AppLayout;