import {
    Link
} from "react-router-dom";


const HomePage = () => {

    return (

        <main
            className="
                !min-h-screen
                !overflow-hidden
                !bg-[#060a0f]
                !text-white
            "
        >

            {/* ==========================================
                NAVBAR
            ========================================== */}

            <header
                className="
                    !sticky
                    !top-0
                    !z-50
                    !border-b
                    !border-white/10
                    !bg-[#060a0f]/85
                    !backdrop-blur-xl
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
                        !px-4
                        !py-4
                        sm:!px-6
                        lg:!px-8
                    "
                >

                    {/* LOGO */}

                    <Link
                        to="/"
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
                                    !tracking-[0.3em]
                                    !text-slate-500
                                "
                            >
                                PROJECT
                            </p>

                            <h1
                                className="
                                    !m-0
                                    !text-xl
                                    !font-black
                                    !tracking-wide
                                    !text-emerald-400
                                    sm:!text-2xl
                                "
                            >
                                FINDER
                            </h1>

                        </div>

                    </Link>


                    {/* NAV ACTIONS */}

                    <div
                        className="
                            !flex
                            !items-center
                            !gap-2
                            sm:!gap-3
                        "
                    >

                        <Link
                            to="/login"
                            className="
                                !rounded-xl
                                !px-3
                                !py-2
                                !text-sm
                                !font-semibold
                                !text-slate-300
                                !no-underline
                                !transition
                                hover:!text-white
                                sm:!px-4
                            "
                        >
                            Login
                        </Link>


                        <Link
                            to="/register"
                            className="
                                !rounded-xl
                                !border
                                !border-emerald-400/30
                                !bg-emerald-400
                                !px-4
                                !py-2
                                !text-sm
                                !font-bold
                                !text-black
                                !no-underline
                                !transition
                                hover:!bg-emerald-300
                                sm:!px-5
                            "
                        >
                            Get Started
                        </Link>

                    </div>

                </div>

            </header>


            {/* ==========================================
                HERO
            ========================================== */}

            <section
                className="
                    !relative
                    !isolate
                    !overflow-hidden
                "
            >

                {/* Background glow */}

                <div
                    className="
                        !pointer-events-none
                        !absolute
                        !-right-40
                        !-top-40
                        !h-96
                        !w-96
                        !rounded-full
                        !bg-emerald-400/10
                        !blur-3xl
                    "
                />


                <div
                    className="
                        !pointer-events-none
                        !absolute
                        !-left-40
                        !top-60
                        !h-96
                        !w-96
                        !rounded-full
                        !bg-cyan-400/5
                        !blur-3xl
                    "
                />


                <div
                    className="
                        !mx-auto
                        !grid
                        !w-full
                        !max-w-7xl
                        !items-center
                        !gap-12
                        !px-4
                        !py-16
                        sm:!px-6
                        sm:!py-20
                        lg:!grid-cols-2
                        lg:!gap-16
                        lg:!px-8
                        lg:!py-28
                    "
                >

                    {/* LEFT */}

                    <div>

                        <div
                            className="
                                !mb-6
                                !inline-flex
                                !items-center
                                !gap-2
                                !rounded-full
                                !border
                                !border-emerald-400/20
                                !bg-emerald-400/5
                                !px-4
                                !py-2
                                !font-mono
                                !text-xs
                                !font-semibold
                                !text-emerald-300
                            "
                        >

                            <span
                                className="
                                    !h-2
                                    !w-2
                                    !rounded-full
                                    !bg-emerald-400
                                    !shadow-[0_0_12px_rgba(52,211,153,0.8)]
                                "
                            />

                            Build. Connect. Collaborate.

                        </div>


                        <h2
                            className="
                                !m-0
                                !max-w-4xl
                                !text-4xl
                                !font-black
                                !leading-[1.08]
                                !tracking-tight
                                sm:!text-5xl
                                md:!text-6xl
                                lg:!text-7xl
                            "
                        >

                            Find the right
                            <span
                                className="
                                    !text-emerald-400
                                "
                            >
                                {" "}people
                            </span>

                            for your next
                            <span
                                className="
                                    !text-slate-400
                                "
                            >
                                {" "}project.
                            </span>

                        </h2>


                        <p
                            className="
                                !mt-6
                                !max-w-2xl
                                !text-base
                                !leading-7
                                !text-slate-400
                                sm:!text-lg
                                sm:!leading-8
                            "
                        >
                            Project Finder helps developers
                            discover projects, find teammates,
                            share skills, and build meaningful
                            products together.
                        </p>


                        {/* HERO BUTTONS */}

                        <div
                            className="
                                !mt-8
                                !flex
                                !flex-col
                                !gap-3
                                sm:!flex-row
                            "
                        >

                            <Link
                                to="/projects"
                                className="
                                    !inline-flex
                                    !min-h-12
                                    !items-center
                                    !justify-center
                                    !rounded-xl
                                    !border
                                    !border-emerald-400/30
                                    !bg-emerald-400
                                    !px-6
                                    !py-3
                                    !text-sm
                                    !font-black
                                    !text-black
                                    !no-underline
                                    !transition
                                    hover:!bg-emerald-300
                                    sm:!text-base
                                "
                            >
                                Explore Projects
                                <span className="!ml-2">
                                    →
                                </span>
                            </Link>


                            <Link
                                to="/projects/create"
                                className="
                                    !inline-flex
                                    !min-h-12
                                    !items-center
                                    !justify-center
                                    !rounded-xl
                                    !border
                                    !border-white/10
                                    !bg-white/[0.03]
                                    !px-6
                                    !py-3
                                    !text-sm
                                    !font-bold
                                    !text-white
                                    !no-underline
                                    !transition
                                    hover:!border-white/20
                                    hover:!bg-white/[0.06]
                                    sm:!text-base
                                "
                            >
                                Create a Project
                            </Link>

                        </div>


                        {/* MINI STATS */}

                        <div
                            className="
                                !mt-10
                                !grid
                                !grid-cols-3
                                !gap-3
                                !border-t
                                !border-white/10
                                !pt-6
                                sm:!max-w-lg
                            "
                        >

                            <div>

                                <p
                                    className="
                                        !m-0
                                        !text-2xl
                                        !font-black
                                        !text-white
                                    "
                                >
                                    01
                                </p>

                                <p
                                    className="
                                        !mt-1
                                        !text-xs
                                        !text-slate-500
                                    "
                                >
                                    Create
                                </p>

                            </div>


                            <div>

                                <p
                                    className="
                                        !m-0
                                        !text-2xl
                                        !font-black
                                        !text-white
                                    "
                                >
                                    02
                                </p>

                                <p
                                    className="
                                        !mt-1
                                        !text-xs
                                        !text-slate-500
                                    "
                                >
                                    Connect
                                </p>

                            </div>


                            <div>

                                <p
                                    className="
                                        !m-0
                                        !text-2xl
                                        !font-black
                                        !text-white
                                    "
                                >
                                    03
                                </p>

                                <p
                                    className="
                                        !mt-1
                                        !text-xs
                                        !text-slate-500
                                    "
                                >
                                    Build
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* RIGHT VISUAL */}

                    <div
                        className="
                            !relative
                        "
                    >

                        <div
                            className="
                                !relative
                                !rounded-3xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-4
                                !shadow-2xl
                                !shadow-black/40
                                sm:!p-5
                            "
                        >

                            {/* Fake terminal */}

                            <div
                                className="
                                    !rounded-2xl
                                    !border
                                    !border-white/10
                                    !bg-[#080d12]
                                    !p-4
                                    sm:!p-5
                                "
                            >

                                <div
                                    className="
                                        !mb-5
                                        !flex
                                        !items-center
                                        !gap-2
                                    "
                                >

                                    <span
                                        className="
                                            !h-3
                                            !w-3
                                            !rounded-full
                                            !bg-red-400/70
                                        "
                                    />

                                    <span
                                        className="
                                            !h-3
                                            !w-3
                                            !rounded-full
                                            !bg-yellow-400/70
                                        "
                                    />

                                    <span
                                        className="
                                            !h-3
                                            !w-3
                                            !rounded-full
                                            !bg-emerald-400/70
                                        "
                                    />

                                    <span
                                        className="
                                            !ml-2
                                            !font-mono
                                            !text-[10px]
                                            !text-slate-600
                                        "
                                    >
                                        project-finder
                                    </span>

                                </div>


                                <div
                                    className="
                                        !space-y-3
                                    "
                                >

                                    <div
                                        className="
                                            !rounded-xl
                                            !border
                                            !border-white/10
                                            !bg-white/[0.02]
                                            !p-4
                                        "
                                    >

                                        <div
                                            className="
                                                !flex
                                                !items-center
                                                !justify-between
                                                !gap-4
                                            "
                                        >

                                            <div>

                                                <p
                                                    className="
                                                        !m-0
                                                        !text-sm
                                                        !font-bold
                                                        !text-white
                                                    "
                                                >
                                                    Meeting Room
                                                </p>

                                                <p
                                                    className="
                                                        !mt-1
                                                        !text-xs
                                                        !text-slate-500
                                                    "
                                                >
                                                    Real-time collaboration
                                                </p>

                                            </div>


                                            <span
                                                className="
                                                    !rounded-full
                                                    !bg-emerald-400/10
                                                    !px-2.5
                                                    !py-1
                                                    !text-[10px]
                                                    !font-bold
                                                    !text-emerald-300
                                                "
                                            >
                                                OPEN
                                            </span>

                                        </div>


                                        <div
                                            className="
                                                !mt-4
                                                !flex
                                                !flex-wrap
                                                !gap-2
                                            "
                                        >

                                            <span className="
                                                !rounded-full
                                                !bg-cyan-400/10
                                                !px-2.5
                                                !py-1
                                                !text-[10px]
                                                !text-cyan-300
                                            ">
                                                React
                                            </span>

                                            <span className="
                                                !rounded-full
                                                !bg-purple-400/10
                                                !px-2.5
                                                !py-1
                                                !text-[10px]
                                                !text-purple-300
                                            ">
                                                Node.js
                                            </span>

                                            <span className="
                                                !rounded-full
                                                !bg-yellow-400/10
                                                !px-2.5
                                                !py-1
                                                !text-[10px]
                                                !text-yellow-300
                                            ">
                                                Socket.IO
                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        className="
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
                                                !bg-white/[0.02]
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
                                                Team
                                            </p>

                                            <p
                                                className="
                                                    !mt-2
                                                    !text-2xl
                                                    !font-black
                                                "
                                            >
                                                04
                                            </p>

                                            <p
                                                className="
                                                    !mt-1
                                                    !text-[10px]
                                                    !text-slate-600
                                                "
                                            >
                                                developers
                                            </p>

                                        </div>


                                        <div
                                            className="
                                                !rounded-xl
                                                !border
                                                !border-white/10
                                                !bg-white/[0.02]
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
                                                Status
                                            </p>

                                            <p
                                                className="
                                                    !mt-2
                                                    !text-sm
                                                    !font-black
                                                    !text-emerald-300
                                                "
                                            >
                                                Building
                                            </p>

                                            <p
                                                className="
                                                    !mt-1
                                                    !text-[10px]
                                                    !text-slate-600
                                                "
                                            >
                                                actively growing
                                            </p>

                                        </div>

                                    </div>


                                    <div
                                        className="
                                            !rounded-xl
                                            !border
                                            !border-emerald-400/10
                                            !bg-emerald-400/[0.03]
                                            !p-4
                                        "
                                    >

                                        <p
                                            className="
                                                !m-0
                                                !font-mono
                                                !text-[10px]
                                                !uppercase
                                                !tracking-widest
                                                !text-emerald-400
                                            "
                                        >
                                            teammate found
                                        </p>

                                        <div
                                            className="
                                                !mt-3
                                                !flex
                                                !items-center
                                                !gap-3
                                            "
                                        >

                                            <div
                                                className="
                                                    !flex
                                                    !h-10
                                                    !w-10
                                                    !items-center
                                                    !justify-center
                                                    !rounded-full
                                                    !bg-gradient-to-br
                                                    !from-emerald-400
                                                    !to-cyan-400
                                                    !font-black
                                                    !text-black
                                                "
                                            >
                                                A
                                            </div>

                                            <div>

                                                <p
                                                    className="
                                                        !m-0
                                                        !text-sm
                                                        !font-bold
                                                    "
                                                >
                                                    Alex
                                                </p>

                                                <p
                                                    className="
                                                        !mt-1
                                                        !text-xs
                                                        !text-slate-500
                                                    "
                                                >
                                                    Full Stack Developer
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                FEATURES
            ========================================== */}

            <section
                className="
                    !border-t
                    !border-white/10
                    !bg-[#090f15]
                "
            >

                <div
                    className="
                        !mx-auto
                        !w-full
                        !max-w-7xl
                        !px-4
                        !py-16
                        sm:!px-6
                        lg:!px-8
                        lg:!py-20
                    "
                >

                    <div
                        className="
                            !max-w-2xl
                        "
                    >

                        <p
                            className="
                                !m-0
                                !font-mono
                                !text-xs
                                !font-bold
                                !uppercase
                                !tracking-[0.2em]
                                !text-emerald-400
                            "
                        >
                            WHY PROJECT FINDER
                        </p>


                        <h2
                            className="
                                !mt-3
                                !text-3xl
                                !font-black
                                !tracking-tight
                                sm:!text-4xl
                            "
                        >
                            Everything you need to
                            build together.
                        </h2>

                    </div>


                    <div
                        className="
                            !mt-10
                            !grid
                            !gap-4
                            sm:!grid-cols-2
                            lg:!grid-cols-4
                        "
                    >

                        {[
                            {
                                icon: "⌕",
                                title: "Discover Projects",
                                text: "Find projects that match your interests and technical skills."
                            },
                            {
                                icon: "◎",
                                title: "Find Teammates",
                                text: "Connect with developers who can bring useful skills to your team."
                            },
                            {
                                icon: "↗",
                                title: "Build Together",
                                text: "Manage members, requests, communication and project progress."
                            },
                            {
                                icon: "▣",
                                title: "Stay Connected",
                                text: "Use project chat and notifications to keep your team in sync."
                            }
                        ].map(
                            (feature) => (

                                <div
                                    key={
                                        feature.title
                                    }
                                    className="
                                        !rounded-2xl
                                        !border
                                        !border-white/10
                                        !bg-[#0d151d]
                                        !p-5
                                        !transition
                                        hover:!-translate-y-1
                                        hover:!border-emerald-400/20
                                    "
                                >

                                    <div
                                        className="
                                            !flex
                                            !h-11
                                            !w-11
                                            !items-center
                                            !justify-center
                                            !rounded-xl
                                            !bg-emerald-400/10
                                            !text-lg
                                            !text-emerald-300
                                        "
                                    >
                                        {
                                            feature.icon
                                        }
                                    </div>


                                    <h3
                                        className="
                                            !mt-5
                                            !text-base
                                            !font-bold
                                        "
                                    >
                                        {
                                            feature.title
                                        }
                                    </h3>


                                    <p
                                        className="
                                            !mt-2
                                            !text-sm
                                            !leading-6
                                            !text-slate-500
                                        "
                                    >
                                        {
                                            feature.text
                                        }
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                </div>

            </section>


            {/* ==========================================
                HOW IT WORKS
            ========================================== */}

            <section
                className="
                    !bg-[#060a0f]
                "
            >

                <div
                    className="
                        !mx-auto
                        !w-full
                        !max-w-7xl
                        !px-4
                        !py-16
                        sm:!px-6
                        lg:!px-8
                        lg:!py-20
                    "
                >

                    <div
                        className="
                            !grid
                            !gap-10
                            lg:!grid-cols-[0.8fr_1.2fr]
                            lg:!items-center
                        "
                    >

                        <div>

                            <p
                                className="
                                    !m-0
                                    !font-mono
                                    !text-xs
                                    !font-bold
                                    !uppercase
                                    !tracking-[0.2em]
                                    !text-cyan-400
                                "
                            >
                                HOW IT WORKS
                            </p>


                            <h2
                                className="
                                    !mt-3
                                    !text-3xl
                                    !font-black
                                    !tracking-tight
                                    sm:!text-4xl
                                "
                            >
                                From idea to team
                                in a few steps.
                            </h2>


                            <p
                                className="
                                    !mt-4
                                    !max-w-lg
                                    !text-sm
                                    !leading-7
                                    !text-slate-500
                                "
                            >
                                Create your profile, discover
                                projects and start building with
                                people who actually match what
                                you need.
                            </p>

                        </div>


                        <div
                            className="
                                !grid
                                !gap-3
                            "
                        >

                            {[
                                [
                                    "01",
                                    "Create your profile",
                                    "Show your skills, interests and experience."
                                ],
                                [
                                    "02",
                                    "Discover a project",
                                    "Browse projects and find something worth building."
                                ],
                                [
                                    "03",
                                    "Connect with teammates",
                                    "Send requests or manage people interested in your project."
                                ],
                                [
                                    "04",
                                    "Start building",
                                    "Use collaboration tools and project chat to move forward."
                                ]
                            ].map(
                                (item) => (

                                    <div
                                        key={
                                            item[0]
                                        }
                                        className="
                                            !flex
                                            !items-start
                                            !gap-4
                                            !rounded-2xl
                                            !border
                                            !border-white/10
                                            !bg-white/[0.02]
                                            !p-4
                                            sm:!p-5
                                        "
                                    >

                                        <span
                                            className="
                                                !font-mono
                                                !text-xs
                                                !font-bold
                                                !text-emerald-400
                                            "
                                        >
                                            {
                                                item[0]
                                            }
                                        </span>


                                        <div>

                                            <h3
                                                className="
                                                    !m-0
                                                    !text-sm
                                                    !font-bold
                                                "
                                            >
                                                {
                                                    item[1]
                                                }
                                            </h3>


                                            <p
                                                className="
                                                    !mt-1
                                                    !mb-0
                                                    !text-xs
                                                    !leading-5
                                                    !text-slate-500
                                                "
                                            >
                                                {
                                                    item[2]
                                                }
                                            </p>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* ==========================================
                CTA
            ========================================== */}

            <section
                className="
                    !border-t
                    !border-white/10
                    !bg-[#090f15]
                "
            >

                <div
                    className="
                        !mx-auto
                        !w-full
                        !max-w-4xl
                        !px-4
                        !py-16
                        !text-center
                        sm:!px-6
                        lg:!py-24
                    "
                >

                    <p
                        className="
                            !m-0
                            !font-mono
                            !text-xs
                            !font-bold
                            !uppercase
                            !tracking-[0.25em]
                            !text-emerald-400
                        "
                    >
                        READY TO BUILD?
                    </p>


                    <h2
                        className="
                            !mx-auto
                            !mt-4
                            !max-w-3xl
                            !text-3xl
                            !font-black
                            !tracking-tight
                            sm:!text-5xl
                        "
                    >
                        Your next great project
                        needs the right team.
                    </h2>


                    <p
                        className="
                            !mx-auto
                            !mt-4
                            !max-w-2xl
                            !text-sm
                            !leading-7
                            !text-slate-500
                            sm:!text-base
                        "
                    >
                        Start building your profile,
                        discover projects and connect
                        with developers who want to create
                        something meaningful.
                    </p>


                    <div
                        className="
                            !mt-8
                            !flex
                            !flex-col
                            !justify-center
                            !gap-3
                            sm:!flex-row
                        "
                    >

                        <Link
                            to="/register"
                            className="
                                !inline-flex
                                !min-h-12
                                !items-center
                                !justify-center
                                !rounded-xl
                                !bg-emerald-400
                                !px-7
                                !py-3
                                !text-sm
                                !font-black
                                !text-black
                                !no-underline
                                !transition
                                hover:!bg-emerald-300
                            "
                        >
                            Create Your Account
                        </Link>


                        <Link
                            to="/projects"
                            className="
                                !inline-flex
                                !min-h-12
                                !items-center
                                !justify-center
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-white/[0.03]
                                !px-7
                                !py-3
                                !text-sm
                                !font-bold
                                !text-white
                                !no-underline
                                !transition
                                hover:!bg-white/[0.06]
                            "
                        >
                            Browse Projects
                        </Link>

                    </div>

                </div>

            </section>


            {/* ==========================================
                FOOTER
            ========================================== */}

            <footer
                className="
                    !border-t
                    !border-white/10
                    !bg-[#060a0f]
                "
            >

                <div
                    className="
                        !mx-auto
                        !flex
                        !w-full
                        !max-w-7xl
                        !flex-col
                        !gap-3
                        !px-4
                        !py-6
                        !text-center
                        sm:!flex-row
                        sm:!items-center
                        sm:!justify-between
                        sm:!px-6
                        sm:!text-left
                        lg:!px-8
                    "
                >

                    <p
                        className="
                            !m-0
                            !font-mono
                            !text-xs
                            !text-slate-600
                        "
                    >
                        © Project Finder
                    </p>


                    <p
                        className="
                            !m-0
                            !text-xs
                            !text-slate-600
                        "
                    >
                        Build something worth sharing.
                    </p>

                </div>

            </footer>

        </main>

    );

};


export default HomePage;