import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router-dom";

import {
    useEffect,
    useState
} from "react";

import Navbar from "../common/Navbar";

import {
    getMyProjects
} from "../../services/project.service";


const AppLayout = () => {

    const navigate =
        useNavigate();


    // ==========================================
    // MY PROJECTS
    // ==========================================

    const [myProjects, setMyProjects] =
        useState([]);

    const [projectsLoading, setProjectsLoading] =
        useState(true);

    // ==========================================
    // MOBILE SIDEBAR
    // ==========================================

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);


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
    // LOAD MY PROJECTS
    // OWNER + MEMBER
    // ==========================================

    useEffect(() => {

        let isMounted = true;


        const fetchMyProjects =
            async() => {

                try {

                    setProjectsLoading(true);


                    const response =
                        await getMyProjects();


                    if (!isMounted) {
                        return;
                    }


                    setMyProjects(
                        response.data || []
                    );

                } catch (error) {

                    console.error(
                        "Failed to load sidebar projects:",
                        error
                    );


                    if (isMounted) {

                        setMyProjects([]);

                    }

                } finally {

                    if (isMounted) {

                        setProjectsLoading(false);

                    }

                }

            };


        fetchMyProjects();


        return () => {

            isMounted = false;

        };

    }, []);


    // ==========================================
    // MOBILE NAVIGATION HELPERS
    // ==========================================

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        document.body.style.overflow =
            mobileMenuOpen
                ? "hidden"
                : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);


    // ==========================================
    // MAIN NAV LINK CLASS
    // ==========================================

    const mainNavClass = ({
        isActive
    }) => {

        return `
            !block
            !rounded-xl
            !px-3
            !py-3
            !text-sm
            sm:!px-4
            !font-semibold
            !transition
            ${
                isActive
                    ? "!border !border-emerald-400/20 !bg-emerald-400/10 !text-emerald-300"
                    : "!text-slate-400 hover:!bg-white/[0.03] hover:!text-white"
            }
        `;

    };


    // ==========================================
    // WORKSPACE NAV LINK CLASS
    // ==========================================

    const workspaceNavClass = ({
        isActive
    }) => {

        return `
            !flex
            !items-center
            !gap-3
            !rounded-xl
            !border
            !px-3
            !py-2.5
            !transition
            sm:!px-4
            sm:!py-3
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
                !w-full
                !overflow-x-hidden
                !bg-[#070b0f]
                !text-white
                lg:!flex
            "
        >

            {/* ==========================================
                MOBILE TOP BAR
            ========================================== */}

            <div
                className="
                    !sticky
                    !top-0
                    !z-40
                    !flex
                    !h-16
                    !w-full
                    !items-center
                    !justify-between
                    !border-b
                    !border-white/10
                    !bg-[#0b1117]/95
                    !px-4
                    !backdrop-blur-xl
                    lg:!hidden
                "
            >

                <NavLink
                    to="/dashboard"
                    onClick={
                        closeMobileMenu
                    }
                    className="
                        !no-underline
                    "
                >

                    <div
                        className="
                            !font-mono
                            !text-[9px]
                            !font-bold
                            !uppercase
                            !tracking-[0.25em]
                            !text-slate-500
                        "
                    >
                        PROJECT_PARTNER
                    </div>

                    <div
                        className="
                            !text-lg
                            !font-black
                            !tracking-wide
                            !text-emerald-400
                        "
                    >
                        FINDER
                    </div>

                </NavLink>


                <button
                    type="button"
                    aria-label={
                        mobileMenuOpen
                            ? "Close navigation menu"
                            : "Open navigation menu"
                    }
                    aria-expanded={
                        mobileMenuOpen
                    }
                    onClick={() =>
                        setMobileMenuOpen(
                            (previous) =>
                                !previous
                        )
                    }
                    className="
                        !flex
                        !h-10
                        !w-10
                        !items-center
                        !justify-center
                        !rounded-xl
                        !border
                        !border-white/10
                        !bg-white/[0.04]
                        !text-slate-200
                        !transition
                        hover:!bg-white/[0.08]
                        active:!scale-95
                    "
                >

                    <span
                        className="
                            !text-xl
                            !leading-none
                        "
                    >
                        {mobileMenuOpen ? "×" : "☰"}
                    </span>

                </button>

            </div>


            {/* ==========================================
                MOBILE SIDEBAR OVERLAY
            ========================================== */}

            {mobileMenuOpen && (

                <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={
                        closeMobileMenu
                    }
                    className="
                        !fixed
                        !inset-0
                        !z-40
                        !bg-black/60
                        !backdrop-blur-[2px]
                        lg:!hidden
                    "
                />

            )}


            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside
                className={`
                    !fixed
                    !inset-y-0
                    !left-0
                    !z-50
                    !flex
                    !h-screen
                    !w-[min(84vw,18rem)]
                    !shrink-0
                    !flex-col
                    !overflow-y-auto
                    !border-r
                    !border-white/10
                    !bg-[#0b1117]
                    !shadow-2xl
                    !transition-transform
                    !duration-300
                    !ease-out
                    ${
                        mobileMenuOpen
                            ? "!translate-x-0"
                            : "!-translate-x-full"
                    }
                    lg:!sticky
                    lg:!top-0
                    lg:!translate-x-0
                    lg:!h-screen
                    lg:!w-72
                    lg:!shadow-none
                `}
            >

                {/* ======================================
                    LOGO
                ====================================== */}

                <div
                    className="
                        !border-b
                        !border-white/10
                        !px-5
                        !py-4
                        sm:!px-6
                        sm:!py-5
                    "
                >

                    <NavLink
                        to="/dashboard"
                        onClick={
                            closeMobileMenu
                        }
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
                            PROJECT_PARTNER
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
                    onClick={closeMobileMenu}
                    className="
                        !min-h-0
                        !flex-1
                        !overflow-y-auto
                        !p-3
                        sm:!p-4
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


                    {/* ==================================
                        MY PROJECTS
                    ================================== */}

                    <div>

                        <div
                            className="
                                !mb-3
                                !flex
                                !items-center
                                !justify-between
                                !px-3
                            "
                        >

                            <p
                                className="
                                    !m-0
                                    !font-mono
                                    !text-[10px]
                                    !font-bold
                                    !uppercase
                                    !tracking-[0.2em]
                                    !text-slate-600
                                "
                            >
                                My Projects
                            </p>


                            {myProjects.length > 0 && (

                                <span
                                    className="
                                        !rounded-full
                                        !bg-white/[0.04]
                                        !px-2
                                        !py-0.5
                                        !text-[9px]
                                        !font-bold
                                        !text-slate-500
                                    "
                                >
                                    {myProjects.length}
                                </span>

                            )}

                        </div>


                        {projectsLoading ? (

                            <div
                                className="
                                    !rounded-xl
                                    !border
                                    !border-white/5
                                    !bg-white/[0.02]
                                    !px-3
                                    !py-3
                                    !text-xs
                                    !text-slate-600
                                "
                            >
                                Loading projects...
                            </div>

                        ) : myProjects.length === 0 ? (

                            <div
                                className="
                                    !rounded-xl
                                    !border
                                    !border-dashed
                                    !border-white/10
                                    !px-3
                                    !py-4
                                    !text-xs
                                    !leading-5
                                    !text-slate-600
                                "
                            >
                                No joined projects yet.
                            </div>

                        ) : (

                            <div
                                className="
                                    !space-y-1.5
                                "
                            >

                                {myProjects.map(
                                    (project) => (

                                        <NavLink
                                            key={
                                                project._id
                                            }
                                            to={
                                                `/projects/${project._id}`
                                            }
                                            className={({
                                                isActive
                                            }) => `
                                                !flex
                                                !items-center
                                                !gap-3
                                                !rounded-xl
                                                !border
                                                !px-3
                                                !py-2.5
                                                !transition
                                                ${
                                                    isActive
                                                        ? "!border-emerald-400/20 !bg-emerald-400/[0.07] !text-emerald-300"
                                                        : "!border-transparent !text-slate-400 hover:!border-white/5 hover:!bg-white/[0.03] hover:!text-slate-200"
                                                }
                                            `}
                                        >

                                            <span
                                                className="
                                                    !flex
                                                    !h-7
                                                    !w-7
                                                    !shrink-0
                                                    !items-center
                                                    !justify-center
                                                    !rounded-lg
                                                    !border
                                                    !border-white/10
                                                    !bg-white/[0.03]
                                                    !font-mono
                                                    !text-[10px]
                                                    !font-bold
                                                    !text-emerald-300
                                                "
                                            >
                                                #
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
                                                        !text-xs
                                                        !font-semibold
                                                    "
                                                >
                                                    {
                                                        project.title
                                                    }
                                                </span>


                                                <span
                                                    className="
                                                        !mt-0.5
                                                        !block
                                                        !text-[9px]
                                                        !uppercase
                                                        !tracking-wider
                                                        !text-slate-600
                                                    "
                                                >
                                                    Project
                                                </span>

                                            </span>

                                        </NavLink>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </nav>


                {/* ======================================
                    LOGOUT
                ====================================== */}

                <div
                    className="
                        !shrink-0
                        !border-t
                        !border-white/10
                        !p-3
                        sm:!p-4
                    "
                >

                    <button
                        type="button"
                        onClick={() => {
                            closeMobileMenu();
                            handleLogout();
                        }}
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
                            !px-3
                            !py-2.5
                            !text-sm
                            sm:!px-4
                            sm:!py-3
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
                MAIN SHELL
            ========================================== */}

            <div
                className="
                    !min-w-0
                    !w-full
                    !flex-1
                    lg:!w-auto
                "
            >

                <Navbar />


                <main
                    className="
                        !min-w-0
                        !w-full
                        !flex-1
                        !overflow-x-hidden
                    "
                >

                    <Outlet />

                </main>

            </div>

        </div>

    );

};


export default AppLayout;