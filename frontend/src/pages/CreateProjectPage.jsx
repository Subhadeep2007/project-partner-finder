import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createProject } from "../services/project.service";

const CreateProjectPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requiredSkills: "",
        teamSize: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const projectData = {
                title: formData.title,
                description: formData.description,

                requiredSkills: formData.requiredSkills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean),

                teamSize: Number(formData.teamSize)
            };

            await createProject(projectData);

            navigate("/projects");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to create project"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-project-page">
            <div className="create-project-page__header">
                <p className="create-project-page__terminal">
                    $ create-project
                </p>

                <h1>Create a Project</h1>

                <p>
                    Describe your project and find the right
                    developers for your team.
                </p>
            </div>

            <form
                className="create-project-form"
                onSubmit={handleSubmit}
            >
                {error && (
                    <div className="create-project-form__error">
                        {error}
                    </div>
                )}

                <div className="create-project-form__group">
                    <label htmlFor="title">
                        Project Title
                    </label>

                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="e.g. AI Study Assistant"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="create-project-form__group">
                    <label htmlFor="description">
                        Project Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        placeholder="Describe your project..."
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        required
                    />
                </div>

                <div className="create-project-form__group">
                    <label htmlFor="requiredSkills">
                        Required Skills
                    </label>

                    <input
                        id="requiredSkills"
                        name="requiredSkills"
                        type="text"
                        placeholder="React, Node.js, MongoDB"
                        value={formData.requiredSkills}
                        onChange={handleChange}
                        required
                    />

                    <small>
                        Separate skills using commas.
                    </small>
                </div>

                <div className="create-project-form__group">
                    <label htmlFor="teamSize">
                        Team Size
                    </label>

                    <input
                        id="teamSize"
                        name="teamSize"
                        type="number"
                        min="1"
                        placeholder="e.g. 4"
                        value={formData.teamSize}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="create-project-form__actions">
                    <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => navigate("/projects")}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="button button--primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Project"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProjectPage;