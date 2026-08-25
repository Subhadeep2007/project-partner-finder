import {
    useEffect,
    useState
} from "react";

import {
    getMyProfile,
    updateMyProfile,
    uploadProfileImage,
    addSkill,
    removeSkill
} from "../services/user.service";


const ProfilePage = () => {

    const [profile, setProfile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [uploadingImage, setUploadingImage] =
        useState(false);

    const [newSkill, setNewSkill] =
        useState("");


    // ==========================================
    // FETCH PROFILE
    // ==========================================

    useEffect(() => {

        const fetchProfile =
            async() => {

                try {

                    setLoading(true);
                    setError("");

                    const response =
                        await getMyProfile();

                    setProfile(
                        response.data
                    );

                } catch (error) {

                    let message =
                        "Failed to load profile";

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


        fetchProfile();

    }, []);


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange =
        (event) => {

            const {
                name,
                value
            } = event.target;


            setProfile(
                (previousProfile) => ({

                    ...previousProfile,

                    [name]:
                        value

                })
            );

        };


    // ==========================================
    // SAVE PROFILE
    // ==========================================

    const handleSaveProfile =
        async(event) => {

            event.preventDefault();

            try {

                setSaving(true);
                setError("");
                setSuccess("");


                const response =
                    await updateMyProfile({

                        name:
                            profile.name,

                        bio:
                            profile.bio,

                        location:
                            profile.location,

                        college:
                            profile.college,

                        course:
                            profile.course,

                        graduationYear:
                            profile.graduationYear ||
                            null,

                        experienceLevel:
                            profile.experienceLevel,

                        interests:
                            profile.interests,

                        github:
                            profile.github,

                        linkedin:
                            profile.linkedin,

                        portfolio:
                            profile.portfolio

                    });


                setProfile(
                    response.data
                );


                setSuccess(
                    "Profile updated successfully"
                );

            } catch (error) {

                let message =
                    "Failed to update profile";

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

                setSaving(false);

            }

        };


    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    const handleImageChange =
        async(event) => {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {

                return;

            }


            try {

                setUploadingImage(true);
                setError("");
                setSuccess("");


                const formData =
                    new FormData();


                formData.append(
                    "profileImage",
                    file
                );


                const response =
                    await uploadProfileImage(
                        formData
                    );


                setProfile(
                    (previousProfile) => ({

                        ...previousProfile,

                        profileImage:
                            response.data.profileImage

                    })
                );


                setSuccess(
                    "Profile image updated successfully"
                );


            } catch (error) {

                let message =
                    "Failed to upload profile image";

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

                setUploadingImage(
                    false
                );

            }

        };


    // ==========================================
    // ADD SKILL
    // ==========================================

    const handleAddSkill =
        async() => {

            const skill =
                newSkill.trim();


            if (!skill) {

                return;

            }


            try {

                setError("");
                setSuccess("");


                const response =
                    await addSkill(
                        skill
                    );


                setProfile(
                    (previousProfile) => ({

                        ...previousProfile,

                        skills:
                            response.data.skills

                    })
                );


                setNewSkill("");


                setSuccess(
                    "Skill added successfully"
                );


            } catch (error) {

                let message =
                    "Failed to add skill";

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

            }

        };


    // ==========================================
    // REMOVE SKILL
    // ==========================================

    const handleRemoveSkill =
        async(skill) => {

            try {

                setError("");
                setSuccess("");


                const response =
                    await removeSkill(
                        skill
                    );


                setProfile(
                    (previousProfile) => ({

                        ...previousProfile,

                        skills:
                            response.data.skills

                    })
                );


                setSuccess(
                    "Skill removed successfully"
                );


            } catch (error) {

                let message =
                    "Failed to remove skill";

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

            }

        };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <main
                className="
                    !min-h-screen
                    !bg-[#060a0f]
                    !px-4
                    !py-8
                    !text-white
                    sm:!px-6
                    lg:!px-10
                "
            >

                <div
                    className="
                        !mx-auto
                        !w-full
                        !max-w-7xl
                    "
                >

                    <div
                        className="
                            !animate-pulse
                            !space-y-6
                        "
                    >

                        <div
                            className="
                                !h-8
                                !w-40
                                !rounded-lg
                                !bg-white/10
                            "
                        />

                        <div
                            className="
                                !h-72
                                !w-full
                                !rounded-3xl
                                !bg-white/5
                            "
                        />

                    </div>

                </div>

            </main>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (
        error &&
        !profile
    ) {

        return (

            <main
                className="
                    !flex
                    !min-h-screen
                    !items-center
                    !justify-center
                    !bg-[#060a0f]
                    !px-4
                    !text-white
                "
            >

                <div
                    className="
                        !max-w-md
                        !rounded-2xl
                        !border
                        !border-red-400/20
                        !bg-red-400/5
                        !p-6
                        !text-center
                        !text-red-300
                    "
                >
                    {error}
                </div>

            </main>

        );

    }


    if (!profile) {

        return (

            <main
                className="
                    !flex
                    !min-h-screen
                    !items-center
                    !justify-center
                    !bg-[#060a0f]
                    !text-white
                "
            >

                <p
                    className="
                        !text-slate-500
                    "
                >
                    Profile not found.
                </p>

            </main>

        );

    }


    const avatarLetter =
        profile.name &&
        profile.name.charAt(0)
            ? profile.name
                .charAt(0)
                .toUpperCase()
            : "U";


    return (

        <main
            className="
                !min-h-screen
                !bg-[#060a0f]
                !text-white
            "
        >

            {/* ======================================
                HERO
            ====================================== */}

            <section
                className="
                    !relative
                    !overflow-hidden
                    !border-b
                    !border-white/10
                    !bg-[#0a1016]
                "
            >

                <div
                    className="
                        !absolute
                        !-right-32
                        !-top-32
                        !h-80
                        !w-80
                        !rounded-full
                        !bg-emerald-400/10
                        !blur-3xl
                    "
                />


                <div
                    className="
                        !absolute
                        !-left-32
                        !bottom-0
                        !h-72
                        !w-72
                        !rounded-full
                        !bg-cyan-400/5
                        !blur-3xl
                    "
                />


                <div
                    className="
                        !relative
                        !mx-auto
                        !w-full
                        !max-w-7xl
                        !px-4
                        !py-8
                        sm:!px-6
                        sm:!py-10
                        lg:!px-10
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
                        ~/profile
                    </p>


                    <div
                        className="
                            !mt-5
                            !flex
                            !flex-col
                            !gap-6
                            sm:!flex-row
                            sm:!items-center
                            sm:!justify-between
                        "
                    >

                        <div
                            className="
                                !flex
                                !items-center
                                !gap-4
                            "
                        >

                            {/* AVATAR */}

                            <div
                                className="
                                    !h-20
                                    !w-20
                                    !shrink-0
                                    !overflow-hidden
                                    !rounded-2xl
                                    !border
                                    !border-emerald-400/20
                                    !bg-gradient-to-br
                                    !from-emerald-400/20
                                    !to-cyan-400/10
                                    !shadow-lg
                                    !shadow-emerald-950/30
                                    sm:!h-24
                                    sm:!w-24
                                "
                            >

                                {profile.profileImage ? (

                                    <img
                                        src={
                                            profile.profileImage
                                        }
                                        alt={
                                            profile.name ||
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
                                            !text-3xl
                                            !font-black
                                            !text-emerald-300
                                        "
                                    >
                                        {
                                            avatarLetter
                                        }
                                    </div>

                                )}

                            </div>


                            <div>

                                <h1
                                    className="
                                        !m-0
                                        !text-2xl
                                        !font-black
                                        !tracking-tight
                                        sm:!text-4xl
                                    "
                                >
                                    {
                                        profile.name ||
                                        "Your Profile"
                                    }
                                </h1>


                                <p
                                    className="
                                        !mt-1
                                        !text-sm
                                        !text-slate-500
                                    "
                                >
                                    {
                                        profile.email ||
                                        "Developer"
                                    }
                                </p>

                            </div>

                        </div>


                        {/* PHOTO BUTTON */}

                        <div>

                            <label
                                htmlFor="profileImage"
                                className="
                                    !inline-flex
                                    !cursor-pointer
                                    !items-center
                                    !justify-center
                                    !rounded-xl
                                    !border
                                    !border-white/10
                                    !bg-white/[0.03]
                                    !px-5
                                    !py-3
                                    !text-sm
                                    !font-bold
                                    !text-slate-200
                                    !transition
                                    hover:!border-emerald-400/30
                                    hover:!bg-emerald-400/5
                                    hover:!text-emerald-300
                                "
                            >
                                {uploadingImage
                                    ? "Uploading..."
                                    : "Change Photo"}
                            </label>


                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleImageChange
                                }
                                hidden
                                disabled={
                                    uploadingImage
                                }
                            />

                        </div>

                    </div>


                    {/* QUICK INFO */}

                    <div
                        className="
                            !mt-7
                            !grid
                            !gap-3
                            sm:!grid-cols-2
                            lg:!grid-cols-4
                        "
                    >

                        <div
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-white/[0.02]
                                !p-4
                            "
                        >

                            <p
                                className="
                                    !m-0
                                    !text-[10px]
                                    !font-bold
                                    !uppercase
                                    !tracking-wider
                                    !text-slate-600
                                "
                            >
                                Location
                            </p>

                            <p
                                className="
                                    !mt-2
                                    !mb-0
                                    !truncate
                                    !text-sm
                                    !font-bold
                                "
                            >
                                {
                                    profile.location ||
                                    "Not added"
                                }
                            </p>

                        </div>


                        <div
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-white/[0.02]
                                !p-4
                            "
                        >

                            <p
                                className="
                                    !m-0
                                    !text-[10px]
                                    !font-bold
                                    !uppercase
                                    !tracking-wider
                                    !text-slate-600
                                "
                            >
                                Experience
                            </p>

                            <p
                                className="
                                    !mt-2
                                    !mb-0
                                    !text-sm
                                    !font-bold
                                    !capitalize
                                "
                            >
                                {
                                    profile.experienceLevel ||
                                    "Beginner"
                                }
                            </p>

                        </div>


                        <div
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-white/[0.02]
                                !p-4
                            "
                        >

                            <p
                                className="
                                    !m-0
                                    !text-[10px]
                                    !font-bold
                                    !uppercase
                                    !tracking-wider
                                    !text-slate-600
                                "
                            >
                                Skills
                            </p>

                            <p
                                className="
                                    !mt-2
                                    !mb-0
                                    !text-sm
                                    !font-bold
                                "
                            >
                                {
                                    Array.isArray(
                                        profile.skills
                                    )
                                        ? profile.skills.length
                                        : 0
                                }{" "}
                                added
                            </p>

                        </div>


                        <div
                            className="
                                !rounded-2xl
                                !border
                                !border-white/10
                                !bg-white/[0.02]
                                !p-4
                            "
                        >

                            <p
                                className="
                                    !m-0
                                    !text-[10px]
                                    !font-bold
                                    !uppercase
                                    !tracking-wider
                                    !text-slate-600
                                "
                            >
                                Graduation
                            </p>

                            <p
                                className="
                                    !mt-2
                                    !mb-0
                                    !text-sm
                                    !font-bold
                                "
                            >
                                {
                                    profile.graduationYear ||
                                    "Not added"
                                }
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* ======================================
                MAIN CONTENT
            ====================================== */}

            <section
                className="
                    !mx-auto
                    !w-full
                    !max-w-7xl
                    !px-4
                    !py-7
                    sm:!px-6
                    sm:!py-10
                    lg:!px-10
                "
            >

                {/* ALERTS */}

                {error && (

                    <div
                        className="
                            !mb-5
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


                {success && (

                    <div
                        className="
                            !mb-5
                            !rounded-xl
                            !border
                            !border-emerald-400/20
                            !bg-emerald-400/5
                            !px-4
                            !py-3
                            !text-sm
                            !text-emerald-300
                        "
                    >
                        {success}
                    </div>

                )}


                <div
                    className="
                        !grid
                        !gap-6
                        lg:!grid-cols-[1fr_340px]
                        lg:!items-start
                    "
                >

                    {/* ==================================
                        LEFT
                    ================================== */}

                    <form
                        onSubmit={
                            handleSaveProfile
                        }
                        className="
                            !space-y-6
                        "
                    >

                        {/* BASIC */}

                        <section
                            className="
                                !rounded-3xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-7
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
                                        !tracking-[0.2em]
                                        !text-emerald-400
                                    "
                                >
                                    01
                                </p>


                                <h2
                                    className="
                                        !mt-2
                                        !text-xl
                                        !font-black
                                    "
                                >
                                    Basic Information
                                </h2>


                                <p
                                    className="
                                        !mt-1
                                        !text-sm
                                        !text-slate-600
                                    "
                                >
                                    Tell teammates who you are.
                                </p>

                            </div>


                            <div
                                className="
                                    !mt-6
                                    !grid
                                    !gap-5
                                    sm:!grid-cols-2
                                "
                            >

                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        Name
                                    </label>


                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            profile.name ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
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
                                            focus:!border-emerald-400/30
                                            focus:!ring-2
                                            focus:!ring-emerald-400/10
                                        "
                                    />

                                </div>


                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        Location
                                    </label>


                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            profile.location ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Kolkata, India"
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
                                            focus:!border-emerald-400/30
                                            focus:!ring-2
                                            focus:!ring-emerald-400/10
                                        "
                                    />

                                </div>


                                <div
                                    className="
                                        sm:!col-span-2
                                    "
                                >

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        Bio
                                    </label>


                                    <textarea
                                        name="bio"
                                        rows="5"
                                        value={
                                            profile.bio ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Tell potential teammates about yourself..."
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
                                            focus:!border-emerald-400/30
                                            focus:!ring-2
                                            focus:!ring-emerald-400/10
                                        "
                                    />

                                </div>

                            </div>

                        </section>


                        {/* EDUCATION */}

                        <section
                            className="
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
                                    !text-[10px]
                                    !font-bold
                                    !uppercase
                                    !tracking-[0.2em]
                                    !text-cyan-400
                                "
                            >
                                02
                            </p>


                            <h2
                                className="
                                    !mt-2
                                    !text-xl
                                    !font-black
                                "
                            >
                                Education & Experience
                            </h2>


                            <div
                                className="
                                    !mt-6
                                    !grid
                                    !gap-5
                                    sm:!grid-cols-2
                                "
                            >

                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        College
                                    </label>


                                    <input
                                        type="text"
                                        name="college"
                                        value={
                                            profile.college ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
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
                                            focus:!border-emerald-400/30
                                        "
                                    />

                                </div>


                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        Course
                                    </label>


                                    <input
                                        type="text"
                                        name="course"
                                        value={
                                            profile.course ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
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
                                            focus:!border-emerald-400/30
                                        "
                                    />

                                </div>


                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        Graduation Year
                                    </label>


                                    <input
                                        type="number"
                                        name="graduationYear"
                                        value={
                                            profile.graduationYear ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
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
                                            focus:!border-emerald-400/30
                                        "
                                    />

                                </div>


                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        Experience Level
                                    </label>


                                    <select
                                        name="experienceLevel"
                                        value={
                                            profile.experienceLevel ||
                                            "beginner"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="
                                            !h-12
                                            !w-full
                                            !rounded-xl
                                            !border
                                            !border-white/10
                                            !bg-[#101820]
                                            !px-4
                                            !text-sm
                                            !text-white
                                            !outline-none
                                            focus:!border-emerald-400/30
                                        "
                                    >

                                        <option value="beginner">
                                            Beginner
                                        </option>

                                        <option value="intermediate">
                                            Intermediate
                                        </option>

                                        <option value="advanced">
                                            Advanced
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </section>


                        {/* LINKS */}

                        <section
                            className="
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
                                    !text-[10px]
                                    !font-bold
                                    !uppercase
                                    !tracking-[0.2em]
                                    !text-purple-400
                                "
                            >
                                03
                            </p>


                            <h2
                                className="
                                    !mt-2
                                    !text-xl
                                    !font-black
                                "
                            >
                                Developer Links
                            </h2>


                            <div
                                className="
                                    !mt-6
                                    !space-y-5
                                "
                            >

                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        GitHub
                                    </label>


                                    <input
                                        type="text"
                                        name="github"
                                        value={
                                            profile.github ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://github.com/username"
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
                                            focus:!border-purple-400/30
                                        "
                                    />

                                </div>


                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        LinkedIn
                                    </label>


                                    <input
                                        type="text"
                                        name="linkedin"
                                        value={
                                            profile.linkedin ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://linkedin.com/in/username"
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
                                            focus:!border-purple-400/30
                                        "
                                    />

                                </div>


                                <div>

                                    <label
                                        className="
                                            !mb-2
                                            !block
                                            !text-sm
                                            !font-semibold
                                            !text-slate-300
                                        "
                                    >
                                        Portfolio
                                    </label>


                                    <input
                                        type="text"
                                        name="portfolio"
                                        value={
                                            profile.portfolio ||
                                            ""
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://yourportfolio.com"
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
                                            focus:!border-purple-400/30
                                        "
                                    />

                                </div>

                            </div>

                        </section>


                        {/* SAVE */}

                        <div
                            className="
                                !flex
                                !justify-end
                            "
                        >

                            <button
                                type="submit"
                                disabled={
                                    saving
                                }
                                className="
                                    !w-full
                                    !rounded-xl
                                    !bg-emerald-400
                                    !px-6
                                    !py-3.5
                                    !text-sm
                                    !font-black
                                    !text-black
                                    !transition
                                    hover:!bg-emerald-300
                                    disabled:!cursor-not-allowed
                                    disabled:!opacity-50
                                    sm:!w-auto
                                "
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Profile"}

                            </button>

                        </div>

                    </form>


                    {/* ==================================
                        RIGHT SIDEBAR
                    ================================== */}

                    <aside
                        className="
                            !space-y-6
                        "
                    >

                        {/* SKILLS */}

                        <section
                            className="
                                !rounded-3xl
                                !border
                                !border-white/10
                                !bg-[#0d151d]
                                !p-5
                                sm:!p-6
                            "
                        >

                            <div
                                className="
                                    !flex
                                    !items-start
                                    !justify-between
                                    !gap-4
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
                                            !tracking-[0.2em]
                                            !text-emerald-400
                                        "
                                    >
                                        Skills
                                    </p>


                                    <h2
                                        className="
                                            !mt-2
                                            !text-xl
                                            !font-black
                                        "
                                    >
                                        Your Stack
                                    </h2>

                                </div>


                                <span
                                    className="
                                        !rounded-full
                                        !bg-emerald-400/10
                                        !px-2.5
                                        !py-1
                                        !text-xs
                                        !font-bold
                                        !text-emerald-300
                                    "
                                >
                                    {
                                        Array.isArray(
                                            profile.skills
                                        )
                                            ? profile.skills.length
                                            : 0
                                    }
                                </span>

                            </div>


                            {/* ADD SKILL */}

                            <div
                                className="
                                    !mt-5
                                    !flex
                                    !gap-2
                                "
                            >

                                <input
                                    type="text"
                                    placeholder="Add a skill..."
                                    value={
                                        newSkill
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewSkill(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={(
                                        event
                                    ) => {

                                        if (
                                            event.key ===
                                            "Enter"
                                        ) {

                                            event.preventDefault();

                                            handleAddSkill();

                                        }

                                    }}
                                    className="
                                        !h-11
                                        !min-w-0
                                        !flex-1
                                        !rounded-xl
                                        !border
                                        !border-white/10
                                        !bg-black/20
                                        !px-3
                                        !text-sm
                                        !text-white
                                        !outline-none
                                        placeholder:!text-slate-600
                                        focus:!border-emerald-400/30
                                    "
                                />


                                <button
                                    type="button"
                                    onClick={
                                        handleAddSkill
                                    }
                                    className="
                                        !rounded-xl
                                        !bg-emerald-400
                                        !px-4
                                        !text-sm
                                        !font-black
                                        !text-black
                                        !transition
                                        hover:!bg-emerald-300
                                    "
                                >
                                    Add
                                </button>

                            </div>


                            {/* SKILL LIST */}

                            <div
                                className="
                                    !mt-5
                                    !flex
                                    !flex-wrap
                                    !gap-2
                                "
                            >

                                {Array.isArray(
                                    profile.skills
                                ) &&
                                profile.skills.length > 0 ? (

                                    profile.skills.map(
                                        (skill) => (

                                            <div
                                                key={
                                                    skill
                                                }
                                                className="
                                                    !group
                                                    !inline-flex
                                                    !items-center
                                                    !gap-2
                                                    !rounded-full
                                                    !border
                                                    !border-emerald-400/15
                                                    !bg-emerald-400/5
                                                    !px-3
                                                    !py-1.5
                                                    !text-xs
                                                    !font-semibold
                                                    !text-emerald-300
                                                "
                                            >

                                                <span>
                                                    {
                                                        skill
                                                    }
                                                </span>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveSkill(
                                                            skill
                                                        )
                                                    }
                                                    className="
                                                        !flex
                                                        !h-5
                                                        !w-5
                                                        !items-center
                                                        !justify-center
                                                        !rounded-full
                                                        !text-slate-600
                                                        !transition
                                                        hover:!bg-red-400/10
                                                        hover:!text-red-300
                                                    "
                                                    aria-label={
                                                        `Remove ${skill}`
                                                    }
                                                >
                                                    ×
                                                </button>

                                            </div>

                                        )
                                    )

                                ) : (

                                    <p
                                        className="
                                            !m-0
                                            !text-sm
                                            !text-slate-600
                                        "
                                    >
                                        No skills added yet.
                                    </p>

                                )}

                            </div>

                        </section>


                        {/* PROFILE TIP */}

                        <section
                            className="
                                !rounded-3xl
                                !border
                                !border-cyan-400/10
                                !bg-cyan-400/[0.03]
                                !p-5
                                sm:!p-6
                            "
                        >

                            <div
                                className="
                                    !flex
                                    !h-10
                                    !w-10
                                    !items-center
                                    !justify-center
                                    !rounded-xl
                                    !bg-cyan-400/10
                                    !text-cyan-300
                                "
                            >
                                ✦
                            </div>


                            <h3
                                className="
                                    !mt-4
                                    !text-base
                                    !font-black
                                "
                            >
                                Make your profile strong
                            </h3>


                            <p
                                className="
                                    !mt-2
                                    !text-sm
                                    !leading-6
                                    !text-slate-500
                                "
                            >
                                Add your skills, education,
                                experience and developer links
                                so project owners can understand
                                what you bring to a team.
                            </p>

                        </section>

                    </aside>

                </div>

            </section>

        </main>

    );

};


export default ProfilePage;