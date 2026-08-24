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


    useEffect(() => {

        const fetchProfile = async() => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getMyProfile();

                setProfile(response.data);

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );

            } finally {

                setLoading(false);

            }

        };

        fetchProfile();

    }, []);


    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setProfile((previousProfile) => ({
            ...previousProfile,
            [name]: value
        }));

    };


    const handleSaveProfile = async(event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const response =
                await updateMyProfile({
                    name: profile.name,
                    bio: profile.bio,
                    location: profile.location,
                    college: profile.college,
                    course: profile.course,
                    graduationYear:
                        profile.graduationYear || null,
                    experienceLevel:
                        profile.experienceLevel,
                    interests:
                        profile.interests,
                    github: profile.github,
                    linkedin: profile.linkedin,
                    portfolio: profile.portfolio
                });

            setProfile(response.data);

            setSuccess(
                "Profile updated successfully"
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to update profile"
            );

        } finally {

            setSaving(false);

        }

    };


    const handleImageChange = async(event) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        try {

            setUploadingImage(true);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append(
                "profileImage",
                file
            );

            const response =
                await uploadProfileImage(
                    formData
                );

            setProfile((previousProfile) => ({
                ...previousProfile,
                profileImage:
                    response.data.profileImage
            }));

            setSuccess(
                "Profile image updated successfully"
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to upload profile image"
            );

        } finally {

            setUploadingImage(false);

        }

    };


    const handleAddSkill = async() => {

        const skill =
            newSkill.trim();

        if (!skill) {
            return;
        }

        try {

            setError("");
            setSuccess("");

            const response =
                await addSkill(skill);

            setProfile((previousProfile) => ({
                ...previousProfile,
                skills: response.data.skills
            }));

            setNewSkill("");

            setSuccess(
                "Skill added successfully"
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to add skill"
            );

        }

    };


    const handleRemoveSkill = async(skill) => {

        try {

            setError("");
            setSuccess("");

            const response =
                await removeSkill(skill);

            setProfile((previousProfile) => ({
                ...previousProfile,
                skills: response.data.skills
            }));

            setSuccess(
                "Skill removed successfully"
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to remove skill"
            );

        }

    };


    if (loading) {

        return (
            <div className="profile-state">
                Loading profile...
            </div>
        );

    }


    if (error && !profile) {

        return (
            <div className="profile-state profile-state--error">
                {error}
            </div>
        );

    }


    if (!profile) {

        return (
            <div className="profile-state">
                Profile not found.
            </div>
        );

    }


    const avatarLetter =
        profile.name?.charAt(0)?.toUpperCase() ||
        "U";


    return (

        <section className="profile-page">

            <div className="profile-page__header">

                <div>

                    <p className="profile-page__terminal">
                        ~/profile
                    </p>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        Manage your profile and skills.
                    </p>

                </div>

            </div>


            {error && (

                <div className="profile-error">
                    {error}
                </div>

            )}


            {success && (

                <div className="profile-success">
                    {success}
                </div>

            )}


            <div className="profile-page__grid">


                {/* PROFILE IMAGE */}

                <aside className="profile-sidebar">

                    <div className="profile-avatar">

                        {profile.profileImage ? (

                            <img
                                src={profile.profileImage}
                                alt={profile.name}
                            />

                        ) : (

                            <span>
                                {avatarLetter}
                            </span>

                        )}

                    </div>


                    <label
                        htmlFor="profileImage"
                        className="profile-image-button"
                    >

                        {uploadingImage
                            ? "Uploading..."
                            : "Change Photo"}

                    </label>


                    <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                        disabled={uploadingImage}
                    />


                    <div className="profile-sidebar__info">

                        <h2>
                            {profile.name}
                        </h2>

                        <p>
                            {profile.email}
                        </p>

                    </div>

                </aside>


                {/* PROFILE FORM */}

                <main className="profile-content">

                    <form
                        onSubmit={handleSaveProfile}
                    >

                        <div className="profile-section">

                            <h2>
                                Basic Information
                            </h2>


                            <div className="profile-form-grid">

                                <div className="profile-form-group">

                                    <label>
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            profile.name || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-form-group">

                                    <label>
                                        Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            profile.location || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-form-group profile-form-group--full">

                                    <label>
                                        Bio
                                    </label>

                                    <textarea
                                        name="bio"
                                        rows="4"
                                        value={
                                            profile.bio || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="profile-section">

                            <h2>
                                Education
                            </h2>


                            <div className="profile-form-grid">

                                <div className="profile-form-group">

                                    <label>
                                        College
                                    </label>

                                    <input
                                        type="text"
                                        name="college"
                                        value={
                                            profile.college || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-form-group">

                                    <label>
                                        Course
                                    </label>

                                    <input
                                        type="text"
                                        name="course"
                                        value={
                                            profile.course || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-form-group">

                                    <label>
                                        Graduation Year
                                    </label>

                                    <input
                                        type="number"
                                        name="graduationYear"
                                        value={
                                            profile.graduationYear || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-form-group">

                                    <label>
                                        Experience Level
                                    </label>

                                    <select
                                        name="experienceLevel"
                                        value={
                                            profile.experienceLevel ||
                                            "beginner"
                                        }
                                        onChange={handleChange}
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

                        </div>


                        <div className="profile-section">

                            <h2>
                                Links
                            </h2>


                            <div className="profile-form-grid">

                                <div className="profile-form-group">

                                    <label>
                                        GitHub
                                    </label>

                                    <input
                                        type="text"
                                        name="github"
                                        value={
                                            profile.github || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-form-group">

                                    <label>
                                        LinkedIn
                                    </label>

                                    <input
                                        type="text"
                                        name="linkedin"
                                        value={
                                            profile.linkedin || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-form-group profile-form-group--full">

                                    <label>
                                        Portfolio
                                    </label>

                                    <input
                                        type="text"
                                        name="portfolio"
                                        value={
                                            profile.portfolio || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Profile"}

                        </button>

                    </form>


                    {/* SKILLS */}

                    <div className="profile-section profile-skills">

                        <h2>
                            Skills
                        </h2>


                        <div className="profile-add-skill">

                            <input
                                type="text"
                                placeholder="Add a skill..."
                                value={newSkill}
                                onChange={(event) =>
                                    setNewSkill(
                                        event.target.value
                                    )
                                }
                                onKeyDown={(event) => {

                                    if (
                                        event.key === "Enter"
                                    ) {

                                        event.preventDefault();

                                        handleAddSkill();

                                    }

                                }}
                            />

                            <button
                                type="button"
                                onClick={handleAddSkill}
                            >
                                Add
                            </button>

                        </div>


                        <div className="profile-skills__list">

                            {profile.skills?.map(
                                (skill) => (

                                    <span
                                        key={skill}
                                        className="profile-skill"
                                    >

                                        {skill}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveSkill(
                                                    skill
                                                )
                                            }
                                            aria-label={`Remove ${skill}`}
                                        >
                                            ×
                                        </button>

                                    </span>

                                )
                            )}

                        </div>

                    </div>

                </main>

            </div>

        </section>

    );

};


export default ProfilePage;