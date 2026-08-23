import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAllProjects } from "../services/project.service";

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState("");
    const [skill, setSkill] = useState("");
    const [sort, setSort] = useState("latest");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllProjects({
                search: search || undefined,
                skill: skill || undefined,
                sort
            });

            setProjects(response.data || []);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load projects"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [sort]);

    const handleSearch = (event) => {
        event.preventDefault();
        fetchProjects();
    };

    return (
        <div className="projects-page">

            <div className="projects-page__header">
                <div>
                    <p className="projects-page__terminal">
                        $ find-projects
                    </p>

                    <h1>Explore Projects</h1>

                    <p>
                        Find projects and connect with developers
                        who need your skills.
                    </p>
                </div>

                <Link
                    to="/projects/create"
                    className="projects-page__create"
                >
                    + Create Project
                </Link>
            </div>

            <form
                className="projects-filter"
                onSubmit={handleSearch}
            >
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Filter by skill..."
                    value={skill}
                    onChange={(event) =>
                        setSkill(event.target.value)
                    }
                />

                <select
                    value={sort}
                    onChange={(event) =>
                        setSort(event.target.value)
                    }
                >
                    <option value="latest">
                        Latest
                    </option>

                    <option value="oldest">
                        Oldest
                    </option>
                </select>

                <button
                    type="submit"
                    className="button button--primary"
                >
                    Search
                </button>
            </form>

            {loading && (
                <div className="projects-state">
                    Loading projects...
                </div>
            )}

            {error && (
                <div className="projects-state projects-state--error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                projects.length === 0 && (
                    <div className="projects-state">
                        No projects found.
                    </div>
                )}

            {!loading &&
                !error &&
                projects.length > 0 && (
                    <div className="projects-grid">
                        {projects.map((project) => (
                            <article
                                className="project-card"
                                key={project._id}
                            >
                                <div className="project-card__top">
                                    <span>
                                        OPEN
                                    </span>

                                    <span>
                                        TEAM: {project.teamSize}
                                    </span>
                                </div>

                                <h2>
                                    {project.title}
                                </h2>

                                <p className="project-card__description">
                                    {project.description}
                                </p>

                                <div className="project-card__skills">
                                    {project.requiredSkills?.map(
                                        (skill) => (
                                            <span
                                                key={skill}
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )}
                                </div>

                                <div className="project-card__footer">
                                    <div>
                                        <span className="project-card__label">
                                            CREATED BY
                                        </span>

                                        <p>
                                            {project.owner?.name ||
                                                "Unknown"}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/projects/${project._id}`}
                                        className="project-card__link"
                                    >
                                        View →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

        </div>
    );
};

export default ProjectsPage;