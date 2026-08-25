import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createProject } from "../services/project.service";

const stages = [
    {
        value: "idea",
        label: "Idea",
        description: "The concept is defined and development has not started."
    },
    {
        value: "planning",
        label: "Planning",
        description: "Requirements, architecture, or roadmap are being prepared."
    },
    {
        value: "half-working",
        label: "Half Working",
        description: "Some features are already implemented and working."
    },
    {
        value: "mvp",
        label: "MVP",
        description: "A basic usable version is available."
    },
    {
        value: "working",
        label: "Working",
        description: "The project is actively working and being improved."
    },
    {
        value: "completed",
        label: "Completed",
        description: "Major development is complete."
    }
];

const partnerRoles = [
    ["frontend", "Frontend"],
    ["backend", "Backend"],
    ["fullstack", "Full Stack"],
    ["ai-ml", "AI / ML"],
    ["data-science", "Data Science"],
    ["ui-ux", "UI / UX"],
    ["devops", "DevOps"],
    ["mobile", "Mobile"],
    ["other", "Other"]
];

const commitments = [
    ["weekend", "Weekend"],
    ["part-time", "Part-time"],
    ["regular", "Regular"]
];

const collaborationModes = [
    ["remote", "Remote"],
    ["hybrid", "Hybrid"],
    ["offline", "Offline"]
];

const CreateProjectPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        stage: "idea",
        githubRepo: "",
        requiredSkills: "",
        lookingFor: [],
        teamSize: 2,
        commitment: "part-time",
        collaborationMode: "remote",
        deadline: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const updateField = (name, value) => {
        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleRoleToggle = (role) => {
        setFormData((previous) => ({
            ...previous,
            lookingFor: previous.lookingFor.includes(role)
                ? previous.lookingFor.filter((item) => item !== role)
                : [...previous.lookingFor, role]
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const skills = formData.requiredSkills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);

            if (skills.length === 0) {
                throw new Error(
                    "Add at least one required skill"
                );
            }

            if (formData.lookingFor.length === 0) {
                throw new Error(
                    "Select at least one partner role"
                );
            }

            const repo =
                formData.githubRepo.trim();

            if (!repo) {
                throw new Error(
                    "GitHub repository URL is required"
                );
            }

            const githubPattern =
                /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/;

            if (!githubPattern.test(repo)) {
                throw new Error(
                    "Enter a valid GitHub repository URL"
                );
            }

            const teamSize =
                Number(formData.teamSize);

            if (
                teamSize < 2 ||
                teamSize > 20
            ) {
                throw new Error(
                    "Team size must be between 2 and 20"
                );
            }

            const projectData = {
                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                stage:
                    formData.stage,

                githubRepo:
                    repo,

                requiredSkills:
                    skills,

                lookingFor:
                    formData.lookingFor,

                teamSize,

                commitment:
                    formData.commitment,

                collaborationMode:
                    formData.collaborationMode,

                deadline:
                    formData.deadline ||
                    null
            };

            await createProject(
                projectData
            );

            navigate("/projects");

        } catch (error) {

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create project"
            );

        } finally {

            setLoading(false);

        }
    };

    const inputBase =
        "!box-border !block !w-full !rounded-xl !border !border-white/10 !bg-[#0b1118] !px-4 !py-3 !text-sm !font-sans !text-white !outline-none placeholder:!text-white/30 focus:!border-emerald-400/70 focus:!ring-2 focus:!ring-emerald-400/10";

    const panelBase =
        "!rounded-2xl !border !border-white/10 !bg-[#0d151d] !shadow-2xl !shadow-black/20";

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
                {/* Header */}
                <header
                    className="
                        !mb-8
                        !max-w-3xl
                    "
                >
                    <p
                        className="
                            !mb-2
                            !font-mono
                            !text-xs
                            !font-medium
                            !text-emerald-400
                            sm:!text-sm
                        "
                    >
                        ~/projects/create
                    </p>

                    <h1
                        className="
                            !m-0
                            !text-3xl
                            !font-extrabold
                            !leading-tight
                            !tracking-tight
                            !text-white
                            sm:!text-4xl
                            lg:!text-5xl
                        "
                    >
                        Create a Project
                    </h1>

                    <p
                        className="
                            !mt-3
                            !max-w-2xl
                            !text-sm
                            !leading-6
                            !text-slate-400
                            sm:!text-base
                        "
                    >
                        Share what you are building, how far
                        it has progressed, and exactly what
                        kind of partner you need.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className={`
                        ${panelBase}
                        !overflow-hidden
                    `}
                >
                    {error && (
                        <div
                            className="
                                !mx-4
                                !mt-4
                                !rounded-xl
                                !border
                                !border-red-500/30
                                !bg-red-500/10
                                !px-4
                                !py-3
                                !text-sm
                                !leading-6
                                !text-red-300
                                sm:!mx-6
                                sm:!mt-6
                                lg:!mx-8
                            "
                        >
                            {error}
                        </div>
                    )}

                    <div
                        className="
                            !space-y-10
                            !p-4
                            sm:!space-y-12
                            sm:!p-6
                            lg:!p-8
                        "
                    >
                        {/* Project Basics */}
                        <section>
                            <div className="!mb-5">
                                <h2
                                    className="
                                        !m-0
                                        !text-lg
                                        !font-bold
                                        !text-white
                                        sm:!text-xl
                                    "
                                >
                                    Project Basics
                                </h2>

                                <p
                                    className="
                                        !mt-1
                                        !text-sm
                                        !leading-6
                                        !text-slate-400
                                    "
                                >
                                    Give partners enough context
                                    to understand the project.
                                </p>
                            </div>

                            <div
                                className="
                                    !grid
                                    !gap-5
                                    lg:!grid-cols-2
                                "
                            >
                                <div className="lg:!col-span-2">
                                    <label
                                        htmlFor="title"
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-200
                                        "
                                    >
                                        Project Title
                                    </label>

                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        required
                                        minLength={3}
                                        maxLength={100}
                                        value={formData.title}
                                        onChange={(event) =>
                                            updateField(
                                                "title",
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. AI Study Assistant"
                                        className={inputBase}
                                    />
                                </div>

                                <div className="lg:!col-span-2">
                                    <div
                                        className="
                                            !mb-2
                                            !flex
                                            !items-center
                                            !justify-between
                                            !gap-3
                                        "
                                    >
                                        <label
                                            htmlFor="description"
                                            className="
                                                !block
                                                !text-sm
                                                !font-semibold
                                                !text-slate-200
                                            "
                                        >
                                            Project Description
                                        </label>

                                        <span
                                            className="
                                                !text-xs
                                                !text-slate-500
                                            "
                                        >
                                            {formData.description.length}/2000
                                        </span>
                                    </div>

                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={7}
                                        required
                                        minLength={10}
                                        maxLength={2000}
                                        value={formData.description}
                                        onChange={(event) =>
                                            updateField(
                                                "description",
                                                event.target.value
                                            )
                                        }
                                        placeholder="What are you building, what problem does it solve, and what is already working?"
                                        className={`${inputBase} !min-h-[170px] !resize-y`}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="teamSize"
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-200
                                        "
                                    >
                                        Team Size
                                    </label>

                                    <input
                                        id="teamSize"
                                        name="teamSize"
                                        type="number"
                                        min={2}
                                        max={20}
                                        required
                                        value={formData.teamSize}
                                        onChange={(event) =>
                                            updateField(
                                                "teamSize",
                                                event.target.value
                                            )
                                        }
                                        className={inputBase}
                                    />

                                    <p
                                        className="
                                            !mt-2
                                            !text-xs
                                            !leading-5
                                            !text-slate-500
                                        "
                                    >
                                        Between 2 and 20 members.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="deadline"
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-200
                                        "
                                    >
                                        Target Deadline
                                        <span
                                            className="
                                                !ml-2
                                                !text-xs
                                                !font-normal
                                                !text-slate-500
                                            "
                                        >
                                            Optional
                                        </span>
                                    </label>

                                    <input
                                        id="deadline"
                                        name="deadline"
                                        type="date"
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        value={formData.deadline}
                                        onChange={(event) =>
                                            updateField(
                                                "deadline",
                                                event.target.value
                                            )
                                        }
                                        className={inputBase}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Stage */}
                        <section>
                            <div className="!mb-5">
                                <h2
                                    className="
                                        !m-0
                                        !text-lg
                                        !font-bold
                                        !text-white
                                        sm:!text-xl
                                    "
                                >
                                    Project Stage
                                </h2>

                                <p
                                    className="
                                        !mt-1
                                        !text-sm
                                        !leading-6
                                        !text-slate-400
                                    "
                                >
                                    Choose the stage that most
                                    accurately describes the current project.
                                </p>
                            </div>

                            <div
                                className="
                                    !grid
                                    !gap-3
                                    sm:!grid-cols-2
                                    xl:!grid-cols-3
                                "
                            >
                                {stages.map((stage) => {

                                    const active =
                                        formData.stage ===
                                        stage.value;

                                    return (
                                        <button
                                            key={stage.value}
                                            type="button"
                                            onClick={() =>
                                                updateField(
                                                    "stage",
                                                    stage.value
                                                )
                                            }
                                            className={`
                                                !min-h-[120px]
                                                !rounded-xl
                                                !border
                                                !p-4
                                                !text-left
                                                !transition
                                                hover:!-translate-y-0.5
                                                ${
                                                    active
                                                        ? "!border-emerald-400/60 !bg-emerald-400/10"
                                                        : "!border-white/10 !bg-[#0b1118] hover:!border-white/20 hover:!bg-white/[0.04]"
                                                }
                                            `}
                                        >
                                            <div
                                                className="
                                                    !flex
                                                    !items-center
                                                    !justify-between
                                                    !gap-3
                                                "
                                            >
                                                <span
                                                    className={`
                                                        !text-sm
                                                        !font-bold
                                                        ${
                                                            active
                                                                ? "!text-emerald-300"
                                                                : "!text-white"
                                                        }
                                                    `}
                                                >
                                                    {stage.label}
                                                </span>

                                                <span
                                                    className={`
                                                        !h-2.5
                                                        !w-2.5
                                                        !rounded-full
                                                        ${
                                                            active
                                                                ? "!bg-emerald-400"
                                                                : "!bg-slate-600"
                                                        }
                                                    `}
                                                />
                                            </div>

                                            <p
                                                className="
                                                    !mt-3
                                                    !text-xs
                                                    !leading-5
                                                    !text-slate-400
                                                "
                                            >
                                                {stage.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Repository */}
                        <section>
                            <div className="!mb-5">
                                <h2
                                    className="
                                        !m-0
                                        !text-lg
                                        !font-bold
                                        !text-white
                                        sm:!text-xl
                                    "
                                >
                                    Repository
                                </h2>

                                <p
                                    className="
                                        !mt-1
                                        !text-sm
                                        !leading-6
                                        !text-slate-400
                                    "
                                >
                                    A GitHub repository is required
                                    so potential partners can review the project.
                                </p>
                            </div>

                            <label
                                htmlFor="githubRepo"
                                className="
                                    !mb-2
                                    !block
                                    !text-sm
                                    !font-semibold
                                    !text-slate-200
                                "
                            >
                                GitHub Repository
                                <span
                                    className="
                                        !ml-2
                                        !text-xs
                                        !font-medium
                                        !text-red-400
                                    "
                                >
                                    Required
                                </span>
                            </label>

                            <input
                                id="githubRepo"
                                name="githubRepo"
                                type="url"
                                required
                                value={formData.githubRepo}
                                onChange={(event) =>
                                    updateField(
                                        "githubRepo",
                                        event.target.value
                                    )
                                }
                                placeholder="https://github.com/username/project"
                                className={inputBase}
                            />

                            <p
                                className="
                                    !mt-2
                                    !text-xs
                                    !leading-5
                                    !text-slate-500
                                "
                            >
                                Example:
                                https://github.com/username/project
                            </p>
                        </section>

                        {/* Skills & Partner Roles */}
                        <section>
                            <div className="!mb-5">
                                <h2
                                    className="
                                        !m-0
                                        !text-lg
                                        !font-bold
                                        !text-white
                                        sm:!text-xl
                                    "
                                >
                                    Skills & Partner Roles
                                </h2>

                                <p
                                    className="
                                        !mt-1
                                        !text-sm
                                        !leading-6
                                        !text-slate-400
                                    "
                                >
                                    Define the skills and roles
                                    you want to bring into the team.
                                </p>
                            </div>

                            <div className="!space-y-6">
                                <div>
                                    <label
                                        htmlFor="requiredSkills"
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-200
                                        "
                                    >
                                        Required Skills
                                    </label>

                                    <input
                                        id="requiredSkills"
                                        name="requiredSkills"
                                        type="text"
                                        required
                                        value={formData.requiredSkills}
                                        onChange={(event) =>
                                            updateField(
                                                "requiredSkills",
                                                event.target.value
                                            )
                                        }
                                        placeholder="React, Node.js, MongoDB, Python"
                                        className={inputBase}
                                    />

                                    <p
                                        className="
                                            !mt-2
                                            !text-xs
                                            !leading-5
                                            !text-slate-500
                                        "
                                    >
                                        Separate multiple skills
                                        with commas.
                                    </p>
                                </div>

                                <div>
                                    <div
                                        className="
                                            !mb-3
                                            !flex
                                            !items-center
                                            !justify-between
                                            !gap-3
                                        "
                                    >
                                        <span
                                            className="
                                                !text-sm
                                                !font-semibold
                                                !text-slate-200
                                            "
                                        >
                                            Looking For
                                        </span>

                                        <span
                                            className="
                                                !text-xs
                                                !text-slate-500
                                            "
                                        >
                                            {formData.lookingFor.length} selected
                                        </span>
                                    </div>

                                    <div
                                        className="
                                            !grid
                                            !gap-2
                                            sm:!grid-cols-2
                                            lg:!grid-cols-3
                                        "
                                    >
                                        {partnerRoles.map(
                                            ([value, label]) => {

                                                const selected =
                                                    formData
                                                        .lookingFor
                                                        .includes(
                                                            value
                                                        );

                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() =>
                                                            handleRoleToggle(
                                                                value
                                                            )
                                                        }
                                                        className={`
                                                            !rounded-xl
                                                            !border
                                                            !px-4
                                                            !py-3
                                                            !text-left
                                                            !text-sm
                                                            !transition
                                                            ${
                                                                selected
                                                                    ? "!border-emerald-400/60 !bg-emerald-400/10 !text-emerald-300"
                                                                    : "!border-white/10 !bg-[#0b1118] !text-slate-300 hover:!border-white/20 hover:!bg-white/[0.04]"
                                                            }
                                                        `}
                                                    >
                                                        <span
                                                            className="
                                                                !flex
                                                                !items-center
                                                                !gap-2
                                                            "
                                                        >
                                                            <span
                                                                className={`
                                                                    !flex
                                                                    !h-5
                                                                    !w-5
                                                                    !items-center
                                                                    !justify-center
                                                                    !rounded-md
                                                                    !border
                                                                    !text-xs
                                                                    ${
                                                                        selected
                                                                            ? "!border-emerald-400 !bg-emerald-400 !text-black"
                                                                            : "!border-white/20 !text-transparent"
                                                                    }
                                                                `}
                                                            >
                                                                ✓
                                                            </span>

                                                            {label}
                                                        </span>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Collaboration */}
                        <section>
                            <div className="!mb-5">
                                <h2
                                    className="
                                        !m-0
                                        !text-lg
                                        !font-bold
                                        !text-white
                                        sm:!text-xl
                                    "
                                >
                                    Collaboration
                                </h2>

                                <p
                                    className="
                                        !mt-1
                                        !text-sm
                                        !leading-6
                                        !text-slate-400
                                    "
                                >
                                    Set clear expectations before
                                    someone joins.
                                </p>
                            </div>

                            <div
                                className="
                                    !grid
                                    !gap-6
                                    md:!grid-cols-2
                                "
                            >
                                <div>
                                    <span
                                        className="
                                            !mb-3
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-200
                                        "
                                    >
                                        Expected Commitment
                                    </span>

                                    <div
                                        className="
                                            !grid
                                            !gap-2
                                            sm:!grid-cols-3
                                        "
                                    >
                                        {commitments.map(
                                            ([value, label]) => {

                                                const active =
                                                    formData.commitment ===
                                                    value;

                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() =>
                                                            updateField(
                                                                "commitment",
                                                                value
                                                            )
                                                        }
                                                        className={`
                                                            !rounded-xl
                                                            !border
                                                            !px-3
                                                            !py-3
                                                            !text-sm
                                                            !font-semibold
                                                            !transition
                                                            ${
                                                                active
                                                                    ? "!border-emerald-400/60 !bg-emerald-400/10 !text-emerald-300"
                                                                    : "!border-white/10 !bg-[#0b1118] !text-slate-300 hover:!border-white/20"
                                                            }
                                                        `}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span
                                        className="
                                            !mb-3
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-200
                                        "
                                    >
                                        Collaboration Mode
                                    </span>

                                    <div
                                        className="
                                            !grid
                                            !gap-2
                                            sm:!grid-cols-3
                                        "
                                    >
                                        {collaborationModes.map(
                                            ([value, label]) => {

                                                const active =
                                                    formData
                                                        .collaborationMode ===
                                                    value;

                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() =>
                                                            updateField(
                                                                "collaborationMode",
                                                                value
                                                            )
                                                        }
                                                        className={`
                                                            !rounded-xl
                                                            !border
                                                            !px-3
                                                            !py-3
                                                            !text-sm
                                                            !font-semibold
                                                            !transition
                                                            ${
                                                                active
                                                                    ? "!border-emerald-400/60 !bg-emerald-400/10 !text-emerald-300"
                                                                    : "!border-white/10 !bg-[#0b1118] !text-slate-300 hover:!border-white/20"
                                                            }
                                                        `}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Actions */}
                    <div
                        className="
                            !flex
                            !flex-col-reverse
                            !gap-3
                            !border-t
                            !border-white/10
                            !bg-[#0b1118]
                            !px-4
                            !py-4
                            sm:!flex-row
                            sm:!items-center
                            sm:!justify-between
                            sm:!px-6
                            lg:!px-8
                        "
                    >
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                navigate("/projects")
                            }
                            className="
                                !min-h-12
                                !rounded-xl
                                !border
                                !border-white/10
                                !bg-transparent
                                !px-5
                                !py-3
                                !text-sm
                                !font-semibold
                                !text-slate-300
                                !transition
                                hover:!border-white/20
                                hover:!bg-white/[0.04]
                                hover:!text-white
                                disabled:!cursor-not-allowed
                                disabled:!opacity-50
                                sm:!min-w-32
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                !min-h-12
                                !rounded-xl
                                !border
                                !border-emerald-400/50
                                !bg-emerald-400
                                !px-6
                                !py-3
                                !text-sm
                                !font-bold
                                !text-black
                                !transition
                                hover:!bg-emerald-300
                                hover:!-translate-y-0.5
                                disabled:!cursor-not-allowed
                                disabled:!opacity-60
                                sm:!min-w-48
                            "
                        >
                            {loading
                                ? "Creating Project..."
                                : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default CreateProjectPage;
