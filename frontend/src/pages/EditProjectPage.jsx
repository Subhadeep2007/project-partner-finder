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
    getProjectById,
    updateProject
} from "../services/project.service";


const EditProjectPage = () => {

    const {
        projectId
    } = useParams();


    const navigate =
        useNavigate();


    // ==========================================
    // FORM DATA
    // ==========================================

    const [formData, setFormData] =
        useState({

            title:
                "",

            description:
                "",

            requiredSkills:
                "",

            teamSize:
                ""

        });


    // ==========================================
    // PROJECT INFORMATION
    // ==========================================

    const [project, setProject] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [submitting, setSubmitting] =
        useState(false);


    const [error, setError] =
        useState("");


    // ==========================================
    // FETCH PROJECT
    // ==========================================

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


                    const projectData =
                        response.data;


                    setProject(
                        projectData
                    );


                    setFormData({

                        title:
                            projectData.title ||
                            "",

                        description:
                            projectData.description ||
                            "",

                        requiredSkills:
                            Array.isArray(
                                projectData.requiredSkills
                            )
                                ? projectData.requiredSkills.join(
                                    ", "
                                )
                                : "",

                        teamSize:
                            projectData.teamSize ||
                            ""

                    });


                } catch (error) {

                    let message =
                        "Failed to load project";


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


        if (projectId) {

            fetchProject();

        }

    }, [
        projectId
    ]);


    // ==========================================
    // HANDLE CHANGE
    // ==========================================

    const handleChange =
        (event) => {

            const {
                name,
                value
            } = event.target;


            setFormData(
                (previousData) => ({

                    ...previousData,

                    [name]:
                        value

                })
            );

        };


    // ==========================================
    // UPDATE PROJECT
    // ==========================================

    const handleSubmit =
        async(event) => {

            event.preventDefault();


            try {

                setSubmitting(
                    true
                );

                setError("");


                const projectData = {

                    title:
                        formData.title
                            .trim(),

                    description:
                        formData.description
                            .trim(),

                    requiredSkills:
                        formData.requiredSkills
                            .split(",")
                            .map(
                                (skill) =>
                                    skill.trim()
                            )
                            .filter(
                                Boolean
                            ),

                    teamSize:
                        Number(
                            formData.teamSize
                        )

                };


                const response =
                    await updateProject(
                        projectId,
                        projectData
                    );


                const updatedProject =
                    response.data;


                setProject(
                    updatedProject
                );


                navigate(
                    `/projects/${projectId}`
                );


            } catch (error) {

                let message =
                    "Failed to update project";


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

                setSubmitting(
                    false
                );

            }

        };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate =
        (date) => {

            if (!date) {

                return "Not available";

            }


            return new Date(
                date
            ).toLocaleDateString(
                [],
                {
                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric"
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
                    !bg-[#070b0f]
                    !px-4
                    !py-8
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
                                !h-5
                                !w-32
                                !rounded
                                !bg-slate-800
                            "
                        />

                        <div
                            className="
                                !h-12
                                !w-72
                                !rounded
                                !bg-slate-800
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
    // LOAD ERROR
    // ==========================================

    if (
        error &&
        !project
    ) {

        return (

            <main
                className="
                    !min-h-screen
                    !bg-[#070b0f]
                    !px-4
                    !py-8
                    !text-white
                    sm:!px-6
                    lg:!px-8
                "
            >

                <div
                    className="
                        !mx-auto
                        !max-w-4xl
                    "
                >

                    <div
                        className="
                            !rounded-2xl
                            !border
                            !border-red-400/20
                            !bg-red-400/5
                            !p-6
                            !text-red-300
                        "
                    >
                        {error}
                    </div>

                </div>

            </main>

        );

    }


    return (

        <main
            className="
                !min-h-screen
                !bg-[#070b0f]
                !px-3
                !py-6
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

                {/* ======================================
                    BACK
                ====================================== */}

                <Link
                    to={`/projects/${projectId}`}
                    className="
                        !inline-flex
                        !items-center
                        !text-sm
                        !font-semibold
                        !text-slate-400
                        !no-underline
                        !transition
                        hover:!text-white
                    "
                >
                    ← Back to Project
                </Link>


                {/* ======================================
                    HEADER
                ====================================== */}

                <div
                    className="
                        !mt-5
                        !rounded-3xl
                        !border
                        !border-white/10
                        !bg-[#0d151d]
                        !p-5
                        sm:!p-7
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
                        ~/projects/edit
                    </p>


                    <h1
                        className="
                            !mt-3
                            !text-3xl
                            !font-black
                            !tracking-tight
                            sm:!text-4xl
                        "
                    >
                        Edit Project
                    </h1>


                    <p
                        className="
                            !mt-2
                            !text-sm
                            !text-slate-500
                        "
                    >
                        Update your project information
                        while reviewing the current project
                        details.
                    </p>

                </div>


                {/* ======================================
                    ERROR
                ====================================== */}

                {error && (

                    <div
                        className="
                            !mt-5
                            !rounded-xl
                            !border
                            !border-red-400/20
                            !bg-red-400/5
                            !px-4
                            !py-3
                            !text-sm
                            !text-red-300
                        "
                    >
                        {error}
                    </div>

                )}


                {/* ======================================
                    PROJECT OVERVIEW
                ====================================== */}

                {project && (

                    <section
                        className="
                            !mt-6
                            !rounded-3xl
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
                                sm:!items-start
                                sm:!justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        !m-0
                                        !text-xs
                                        !font-bold
                                        !uppercase
                                        !tracking-wider
                                        !text-slate-500
                                    "
                                >
                                    Current Project
                                </p>


                                <h2
                                    className="
                                        !mt-2
                                        !text-xl
                                        !font-black
                                    "
                                >
                                    {
                                        project.title
                                    }
                                </h2>

                            </div>


                            {/* STATUS */}

                            <span
                                className="
                                    !inline-flex
                                    !w-fit
                                    !rounded-full
                                    !border
                                    !border-emerald-400/20
                                    !bg-emerald-400/10
                                    !px-3
                                    !py-1.5
                                    !text-xs
                                    !font-bold
                                    !uppercase
                                    !tracking-wider
                                    !text-emerald-300
                                "
                            >
                                {
                                    project.status ||
                                    "open"
                                }
                            </span>

                        </div>


                        {/* INFO GRID */}

                        <div
                            className="
                                !mt-6
                                !grid
                                !gap-3
                                sm:!grid-cols-2
                                lg:!grid-cols-4
                            "
                        >

                            {/* OWNER */}

                            <div
                                className="
                                    !rounded-2xl
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
                                        !text-slate-600
                                    "
                                >
                                    Owner
                                </p>


                                <p
                                    className="
                                        !mt-2
                                        !text-sm
                                        !font-bold
                                        !text-white
                                    "
                                >
                                    {
                                        project.owner &&
                                        project.owner.name
                                            ? project.owner.name
                                            : "Unknown"
                                    }
                                </p>

                            </div>


                            {/* CURRENT MEMBERS */}

                            <div
                                className="
                                    !rounded-2xl
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
                                        !text-slate-600
                                    "
                                >
                                    Team
                                </p>


                                <p
                                    className="
                                        !mt-2
                                        !text-sm
                                        !font-bold
                                        !text-white
                                    "
                                >
                                    {
                                        project.currentMembers ||
                                        0
                                    }
                                    {" / "}
                                    {
                                        project.teamSize ||
                                        0
                                    }
                                </p>

                            </div>


                            {/* CREATED */}

                            <div
                                className="
                                    !rounded-2xl
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
                                        !text-slate-600
                                    "
                                >
                                    Created
                                </p>


                                <p
                                    className="
                                        !mt-2
                                        !text-sm
                                        !font-bold
                                        !text-white
                                    "
                                >
                                    {
                                        formatDate(
                                            project.createdAt
                                        )
                                    }
                                </p>

                            </div>


                            {/* MEMBERS */}

                            <div
                                className="
                                    !rounded-2xl
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
                                        !text-slate-600
                                    "
                                >
                                    Members
                                </p>


                                <p
                                    className="
                                        !mt-2
                                        !text-sm
                                        !font-bold
                                        !text-white
                                    "
                                >
                                    {
                                        Array.isArray(
                                            project.members
                                        )
                                            ? project.members.length
                                            : 0
                                    }
                                    {" "}members
                                </p>

                            </div>

                        </div>


                        {/* CURRENT MEMBERS LIST */}

                        {Array.isArray(
                            project.members
                        ) &&
                        project.members.length > 0 && (

                            <div
                                className="
                                    !mt-6
                                    !border-t
                                    !border-white/10
                                    !pt-6
                                "
                            >

                                <h3
                                    className="
                                        !m-0
                                        !text-sm
                                        !font-bold
                                        !text-white
                                    "
                                >
                                    Current Team Members
                                </h3>


                                <div
                                    className="
                                        !mt-4
                                        !grid
                                        !gap-3
                                        sm:!grid-cols-2
                                        lg:!grid-cols-3
                                    "
                                >

                                    {project.members.map(
                                        (
                                            member
                                        ) => (

                                            <div
                                                key={
                                                    member._id
                                                }
                                                className="
                                                    !flex
                                                    !items-center
                                                    !gap-3
                                                    !rounded-2xl
                                                    !border
                                                    !border-white/10
                                                    !bg-black/10
                                                    !p-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        !h-10
                                                        !w-10
                                                        !shrink-0
                                                        !overflow-hidden
                                                        !rounded-full
                                                        !bg-emerald-400/10
                                                    "
                                                >

                                                    {member.profileImage ? (

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
                                                                !font-bold
                                                                !text-emerald-300
                                                            "
                                                        >
                                                            {
                                                                (
                                                                    member.name ||
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

                                                    <p
                                                        className="
                                                            !m-0
                                                            !truncate
                                                            !text-sm
                                                            !font-bold
                                                        "
                                                    >
                                                        {
                                                            member.name ||
                                                            "Unknown User"
                                                        }
                                                    </p>


                                                    <p
                                                        className="
                                                            !mt-1
                                                            !text-xs
                                                            !text-slate-500
                                                        "
                                                    >
                                                        Team Member
                                                    </p>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    </section>

                )}


                {/* ======================================
                    EDIT FORM
                ====================================== */}

                <form
                    className="
                        !mt-6
                        !rounded-3xl
                        !border
                        !border-white/10
                        !bg-[#0d151d]
                        !p-5
                        sm:!p-7
                    "
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div
                        className="
                            !mb-6
                        "
                    >

                        <p
                            className="
                                !m-0
                                !text-xs
                                !font-bold
                                !uppercase
                                !tracking-wider
                                !text-emerald-400
                            "
                        >
                            Editable Information
                        </p>


                        <h2
                            className="
                                !mt-2
                                !text-xl
                                !font-black
                            "
                        >
                            Project Configuration
                        </h2>

                    </div>


                    {/* TITLE */}

                    <div
                        className="
                            !space-y-2
                        "
                    >

                        <label
                            htmlFor="title"
                            className="
                                !block
                                !text-sm
                                !font-semibold
                                !text-slate-300
                            "
                        >
                            Project Title
                        </label>


                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={
                                formData.title
                            }
                            onChange={
                                handleChange
                            }
                            required
                            className="
                                !h-12
                                !w-full
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-black/20
                                !px-4
                                !text-sm
                                !text-white
                                !outline-none
                                focus:!border-emerald-400/40
                                focus:!ring-2
                                focus:!ring-emerald-400/10
                            "
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div
                        className="
                            !mt-5
                            !space-y-2
                        "
                    >

                        <label
                            htmlFor="description"
                            className="
                                !block
                                !text-sm
                                !font-semibold
                                !text-slate-300
                            "
                        >
                            Project Description
                        </label>


                        <textarea
                            id="description"
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                            rows="7"
                            required
                            className="
                                !w-full
                                !resize-y
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-black/20
                                !px-4
                                !py-3
                                !text-sm
                                !leading-6
                                !text-white
                                !outline-none
                                focus:!border-emerald-400/40
                                focus:!ring-2
                                focus:!ring-emerald-400/10
                            "
                        />

                    </div>


                    {/* SKILLS */}

                    <div
                        className="
                            !mt-5
                            !space-y-2
                        "
                    >

                        <label
                            htmlFor="requiredSkills"
                            className="
                                !block
                                !text-sm
                                !font-semibold
                                !text-slate-300
                            "
                        >
                            Required Skills
                        </label>


                        <input
                            id="requiredSkills"
                            type="text"
                            name="requiredSkills"
                            value={
                                formData.requiredSkills
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="
                                React, Node.js, MongoDB
                            "
                            required
                            className="
                                !h-12
                                !w-full
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-black/20
                                !px-4
                                !text-sm
                                !text-white
                                !outline-none
                                focus:!border-emerald-400/40
                                focus:!ring-2
                                focus:!ring-emerald-400/10
                            "
                        />


                        <p
                            className="
                                !m-0
                                !text-xs
                                !text-slate-600
                            "
                        >
                            Separate each skill with a comma.
                        </p>

                    </div>


                    {/* TEAM SIZE */}

                    <div
                        className="
                            !mt-5
                            !space-y-2
                        "
                    >

                        <label
                            htmlFor="teamSize"
                            className="
                                !block
                                !text-sm
                                !font-semibold
                                !text-slate-300
                            "
                        >
                            Team Size
                        </label>


                        <input
                            id="teamSize"
                            type="number"
                            name="teamSize"
                            value={
                                formData.teamSize
                            }
                            onChange={
                                handleChange
                            }
                            min="2"
                            max="20"
                            required
                            className="
                                !h-12
                                !w-full
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-black/20
                                !px-4
                                !text-sm
                                !text-white
                                !outline-none
                                focus:!border-emerald-400/40
                                focus:!ring-2
                                focus:!ring-emerald-400/10
                            "
                        />


                        <p
                            className="
                                !m-0
                                !text-xs
                                !text-slate-600
                            "
                        >
                            Team size must be between 2 and 20.
                        </p>

                    </div>


                    {/* ACTIONS */}

                    <div
                        className="
                            !mt-7
                            !flex
                            !flex-col-reverse
                            !gap-3
                            sm:!flex-row
                            sm:!justify-end
                        "
                    >

                        <Link
                            to={`/projects/${projectId}`}
                            className="
                                !inline-flex
                                !min-h-11
                                !items-center
                                !justify-center
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-white/[0.03]
                                !px-5
                                !py-2.5
                                !text-sm
                                !font-semibold
                                !text-slate-300
                                !no-underline
                                !transition
                                hover:!bg-white/[0.06]
                                hover:!text-white
                            "
                        >
                            Cancel
                        </Link>


                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="
                                !inline-flex
                                !min-h-11
                                !items-center
                                !justify-center
                                !rounded-xl
                                !border
                                !border-emerald-400/30
                                !bg-emerald-400
                                !px-5
                                !py-2.5
                                !text-sm
                                !font-black
                                !text-black
                                !transition
                                hover:!bg-emerald-300
                                disabled:!cursor-not-allowed
                                disabled:!opacity-50
                            "
                        >

                            {submitting
                                ? "Updating..."
                                : "Save Changes"}

                        </button>

                    </div>

                </form>

            </div>

        </main>

    );

};


export default EditProjectPage;