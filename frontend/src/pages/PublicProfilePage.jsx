import {
    Link,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";


// ==========================================
// HELPERS
// ==========================================

const getUserId = (user) => {

    if (!user) {
        return null;
    }

    const id =
        user._id ||
        user.id ||
        user.userId;

    return id
        ? id.toString()
        : null;
};


const getInitial = (name) => {

    if (!name) {
        return "U";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();

};


const labelValue = (value) => {

    if (!value) {
        return "Not provided";
    }

    return value;

};


// ==========================================
// PUBLIC PROFILE PAGE
// ==========================================

const PublicProfilePage = () => {

    const {
        userId
    } = useParams();

    const location =
        useLocation();

    const navigate =
        useNavigate();


    /*
        ProjectDetailsPage can pass the selected
        owner/member through react-router state.

        This keeps this page independent from
        index.css and does not guess a backend
        profile endpoint.
    */

    const user =
        location.state?.user || null;


    // ==========================================
    // NO PROFILE DATA
    // ==========================================

    if (!user) {

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
                        !max-w-3xl
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="
                            !mb-6
                            !rounded-xl
                            !border
                            !border-white/10
                            !bg-white/[0.03]
                            !px-4
                            !py-2.5
                            !text-sm
                            !font-semibold
                            !text-slate-300
                            hover:!border-white/20
                            hover:!bg-white/[0.06]
                            hover:!text-white
                        "
                    >
                        ← Back
                    </button>


                    <section
                        className="
                            !rounded-3xl
                            !border
                            !border-white/10
                            !bg-[#0d151d]
                            !p-6
                            !text-center
                            sm:!p-10
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
                                !border-amber-400/20
                                !bg-amber-400/10
                                !text-2xl
                            "
                        >
                            !
                        </div>


                        <h1
                            className="
                                !mt-5
                                !mb-0
                                !text-2xl
                                !font-extrabold
                                !text-white
                            "
                        >
                            Profile data unavailable
                        </h1>


                        <p
                            className="
                                !mx-auto
                                !mt-3
                                !max-w-lg
                                !text-sm
                                !leading-6
                                !text-slate-400
                            "
                        >
                            This profile page needs the selected user
                            data from the previous page. Open a profile
                            from Project Details to view it.
                        </p>

                    </section>

                </div>

            </main>

        );

    }


    const profileUserId =
        getUserId(user) ||
        userId;


    const skills =
        Array.isArray(user.skills)
            ? user.skills
            : [];


    const profileLinks = [
        {
            label: "GitHub",
            value: user.github,
            href: user.github
        },
        {
            label: "LinkedIn",
            value: user.linkedin,
            href: user.linkedin
        },
        {
            label: "Portfolio",
            value: user.portfolio,
            href: user.portfolio
        }
    ].filter(
        (item) =>
            item.value
    );


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
                    TOP
                ========================================== */}

                <div
                    className="
                        !mb-6
                        !flex
                        !items-center
                        !justify-between
                        !gap-3
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="
                            !rounded-xl
                            !border
                            !border-white/10
                            !bg-white/[0.03]
                            !px-4
                            !py-2.5
                            !text-sm
                            !font-semibold
                            !text-slate-300
                            !transition
                            hover:!border-white/20
                            hover:!bg-white/[0.06]
                            hover:!text-white
                        "
                    >
                        ← Back
                    </button>


                    <span
                        className="
                            !hidden
                            !rounded-full
                            !border
                            !border-emerald-400/20
                            !bg-emerald-400/10
                            !px-3
                            !py-1.5
                            !text-xs
                            !font-semibold
                            !text-emerald-300
                            sm:!inline-flex
                        "
                    >
                        Developer Profile
                    </span>

                </div>


                {/* ==========================================
                    PROFILE HERO
                ========================================== */}

                <section
                    className="
                        !overflow-hidden
                        !rounded-3xl
                        !border
                        !border-white/10
                        !bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_35%),#0d151d]
                        !shadow-2xl
                        !shadow-black/20
                    "
                >

                    <div
                        className="
                            !grid
                            !gap-6
                            !p-5
                            sm:!p-7
                            lg:!grid-cols-[260px_minmax(0,1fr)]
                            lg:!p-9
                        "
                    >

                        {/* PHOTO */}

                        <div
                            className="
                                !flex
                                !justify-center
                                lg:!justify-start
                            "
                        >

                            <div
                                className="
                                    !h-56
                                    !w-56
                                    !overflow-hidden
                                    !rounded-3xl
                                    !border
                                    !border-emerald-400/30
                                    !bg-slate-900
                                    !shadow-xl
                                    !shadow-black/30
                                    sm:!h-64
                                    sm:!w-64
                                "
                            >

                                {user.profileImage ? (

                                    <img
                                        src={
                                            user.profileImage
                                        }
                                        alt={
                                            user.name ||
                                            "Profile"
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
                                            !text-7xl
                                            !font-extrabold
                                            !text-emerald-300
                                        "
                                    >
                                        {getInitial(
                                            user.name
                                        )}
                                    </div>

                                )}

                            </div>

                        </div>


                        {/* INFO */}

                        <div
                            className="
                                !min-w-0
                                !flex
                                !flex-col
                                !justify-center
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
                                ~/profile/{profileUserId || "user"}
                            </p>


                            <h1
                                className="
                                    !m-0
                                    !break-words
                                    !text-3xl
                                    !font-extrabold
                                    !tracking-tight
                                    !text-white
                                    sm:!text-4xl
                                "
                            >
                                {labelValue(
                                    user.name
                                )}
                            </h1>


                            {user.email && (

    <a
        href={`mailto:${user.email}`}
        className="
            !mt-2
            !inline-flex
            !max-w-full
            !items-center
            !gap-2
            !break-all
            !text-sm
            !font-medium
            !text-slate-400
            !no-underline
            !transition
            hover:!text-emerald-300
        "
    >

        <span>
            ✉
        </span>

        <span>
            {user.email}
        </span>

    </a>

)}


                            <div
                                className="
                                    !mt-5
                                    !flex
                                    !flex-wrap
                                    !gap-2
                                "
                            >

                                {[
                                    [
                                        "Location",
                                        user.location
                                    ],
                                    [
                                        "College",
                                        user.college
                                    ],
                                    [
                                        "Course",
                                        user.course
                                    ]
                                ].map(
                                    (
                                        [
                                            label,
                                            value
                                        ]
                                    ) => (

                                        <span
                                            key={label}
                                            className="
                                                !rounded-full
                                                !border
                                                !border-white/10
                                                !bg-black/10
                                                !px-3
                                                !py-1.5
                                                !text-xs
                                                !font-medium
                                                !text-slate-300
                                            "
                                        >
                                            {label}:{" "}
                                            {value ||
                                                "Not provided"}
                                        </span>

                                    )
                                )}

                            </div>


                            <div
                                className="
                                    !mt-6
                                    !flex
                                    !flex-wrap
                                    !gap-3
                                "
                            >

                                {profileLinks.map(
                                    (link) => (

                                        <a
                                            key={
                                                link.label
                                            }
                                            href={
                                                link.href
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="
                                                !inline-flex
                                                !items-center
                                                !rounded-xl
                                                !border
                                                !border-emerald-400/20
                                                !bg-emerald-400/5
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
                                            {link.label} ↗
                                        </a>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    CONTENT
                ========================================== */}

                <div
                    className="
                        !mt-6
                        !grid
                        !gap-6
                        lg:!grid-cols-[minmax(0,1fr)_320px]
                    "
                >

                    {/* MAIN */}

                    <div
                        className="
                            !min-w-0
                            !space-y-6
                        "
                    >

                        {/* BIO */}

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
                                About
                            </p>

                            <h2
                                className="
                                    !m-0
                                    !text-xl
                                    !font-bold
                                "
                            >
                                About {user.name || "User"}
                            </h2>

                            <p
                                className="
                                    !mt-4
                                    !mb-0
                                    !whitespace-pre-wrap
                                    !text-sm
                                    !leading-7
                                    !text-slate-300
                                    sm:!text-base
                                "
                            >
                                {user.bio ||
                                    "No bio has been added yet."}
                            </p>

                        </section>


                        {/* SKILLS */}

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
                                    !items-end
                                    !justify-between
                                    !gap-3
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
                                        Expertise
                                    </p>

                                    <h2
                                        className="
                                            !m-0
                                            !text-xl
                                            !font-bold
                                        "
                                    >
                                        Skills
                                    </h2>

                                </div>

                                <span
                                    className="
                                        !text-xs
                                        !text-slate-500
                                    "
                                >
                                    {skills.length} skill
                                    {skills.length === 1
                                        ? ""
                                        : "s"}
                                </span>

                            </div>


                            {skills.length > 0 ? (

                                <div
                                    className="
                                        !mt-5
                                        !flex
                                        !flex-wrap
                                        !gap-2
                                    "
                                >

                                    {skills.map(
                                        (skill) => (

                                            <span
                                                key={skill}
                                                className="
                                                    !rounded-full
                                                    !border
                                                    !border-emerald-400/20
                                                    !bg-emerald-400/10
                                                    !px-3
                                                    !py-2
                                                    !text-xs
                                                    !font-semibold
                                                    !text-emerald-300
                                                "
                                            >
                                                {skill}
                                            </span>

                                        )
                                    )}

                                </div>

                            ) : (

                                <p
                                    className="
                                        !mt-4
                                        !mb-0
                                        !text-sm
                                        !text-slate-500
                                    "
                                >
                                    No skills have been added yet.
                                </p>

                            )}

                        </section>

                    </div>


                    {/* SIDE INFO */}

                    <aside
                        className="
                            !space-y-6
                        "
                    >

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
                                Profile Details
                            </p>


                            <div
                                className="
                                    !mt-5
                                    !space-y-4
                                "
                            >

                                {[
                                    [
                                        "Name",
                                        user.name
                                    ],
                                    [
                                        "Location",
                                        user.location
                                    ],
                                    [
                                        "College",
                                        user.college
                                    ],
                                    [
                                        "Course",
                                        user.course
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
                                                    !tracking-wider
                                                    !text-slate-500
                                                "
                                            >
                                                {label}
                                            </p>

                                            <p
                                                className="
                                                    !mt-1.5
                                                    !mb-0
                                                    !break-words
                                                    !text-sm
                                                    !font-semibold
                                                    !text-slate-200
                                                "
                                            >
                                                {value ||
                                                    "Not provided"}
                                            </p>

                                        </div>

                                    )
                                )}

                            </div>

                        </section>


                        <section
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-emerald-400/[0.03]
                                !p-5
                                sm:!p-6
                            "
                        >

                            <p
                                className="
                                    !m-0
                                    !text-sm
                                    !font-semibold
                                    !text-white
                                "
                            >
                                Want to know more?
                            </p>

                            <p
                                className="
                                    !mt-2
                                    !mb-0
                                    !text-sm
                                    !leading-6
                                    !text-slate-400
                                "
                            >
                                Visit this developer's GitHub,
                                LinkedIn, or portfolio using the
                                links above.
                            </p>

                        </section>

                    </aside>

                </div>

            </div>

        </main>

    );

};

export default PublicProfilePage;