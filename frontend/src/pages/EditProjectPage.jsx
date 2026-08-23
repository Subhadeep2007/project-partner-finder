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

    const { projectId } = useParams();

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requiredSkills: "",
        teamSize: ""
    });

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const fetchProject = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await getProjectById(projectId);

                const project =
                    response.data;

                setFormData({
                    title:
                        project.title || "",

                    description:
                        project.description || "",

                    requiredSkills:
                        project.requiredSkills?.join(", ") || "",

                    teamSize:
                        project.teamSize || ""
                });

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load project"
                );

            } finally {

                setLoading(false);

            }

        };

        fetchProject();

    }, [projectId]);

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

    };

    const handleSubmit = async(event) => {

        event.preventDefault();

        try {

            setSubmitting(true);
            setError("");

            const projectData = {
                title:
                    formData.title,

                description:
                    formData.description,

                requiredSkills:
                    formData.requiredSkills
                        .split(",")
                        .map(
                            (skill) =>
                            skill.trim()
                        )
                        .filter(Boolean),

                teamSize:
                    Number(
                        formData.teamSize
                    )
            };

            await updateProject(
                projectId,
                projectData
            );

            navigate(
                `/projects/${projectId}`
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to update project"
            );

        } finally {

            setSubmitting(false);

        }

    };

    if (loading) {

        return (
            <div className="edit-project-state">
                Loading project...
            </div>
        );

    }

    if (error && !formData.title) {

        return (
            <div className="edit-project-state edit-project-state--error">
                {error}
            </div>
        );

    }

    return (

        <section className="edit-project-page">

            <Link
                to={`/projects/${projectId}`}
                className="edit-project__back"
            >
                ← Back to Project
            </Link>

            <div className="edit-project__header">

                <p>
                    ~/projects/edit
                </p>

                <h1>
                    Edit Project
                </h1>

                <span>
                    Update your project information.
                </span>

            </div>

            <form
                className="edit-project-form"
                onSubmit={handleSubmit}
            >

                {error && (

                    <div className="edit-project-form__error">
                        {error}
                    </div>

                )}

                <div className="edit-project-form__group">

                    <label>
                        Project Title
                    </label>

                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />

                </div>

                <div className="edit-project-form__group">

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="6"
                        required
                    />

                </div>

                <div className="edit-project-form__group">

                    <label>
                        Required Skills
                    </label>

                    <input
                        type="text"
                        name="requiredSkills"
                        value={formData.requiredSkills}
                        onChange={handleChange}
                        placeholder="React, Node.js, MongoDB"
                        required
                    />

                    <small>
                        Separate skills using commas.
                    </small>

                </div>

                <div className="edit-project-form__group">

                    <label>
                        Team Size
                    </label>

                    <input
                        type="number"
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        min="1"
                        required
                    />

                </div>

                <button
                    type="submit"
                    className="button button--primary"
                    disabled={submitting}
                >

                    {submitting
                        ? "Updating..."
                        : "Update Project"}

                </button>

            </form>

        </section>

    );

};

export default EditProjectPage;