import {
    useEffect,
    useState
} from "react";

import { Link } from "react-router-dom";

import {
    getMyProjects
} from "../services/project.service";

const DashboardPage = () => {

    const [projects, setProjects] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const fetchProjects = async () => {

            try {
                setLoading(true);
                setError("");

                const response =
                    await getMyProjects();

                setProjects(
                    response.data || []
                );

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Failed to load projects"
                );

            } finally {

                setLoading(false);

            }

        };

        fetchProjects();

    }, []);

    return (
        <section className="dashboard">

            <div className="dashboard__header">

                <div>
                    <p className="dashboard__terminal">
                        ~/dashboard
                    </p>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Manage your projects and
                        track your work.
                    </p>
                </div>

                <Link
                    to="/projects"
                    className="dashboard__projects-link"
                >
                    View Projects
                </Link>

            </div>

            {/* Loading State */}

            {loading && (
                <div className="dashboard__state">
                    Loading projects...
                </div>
            )}

            {/* Error State */}

            {!loading && error && (
                <div className="dashboard__error">
                    {error}
                </div>
            )}

            {/* Dashboard Content */}

            {!loading && !error && (
                <>

                    <div className="dashboard__stats">

                        <div className="dashboard-stat">

                            <p>
                                My Projects
                            </p>

                            <strong>
                                {projects.length}
                            </strong>

                        </div>

                    </div>

                    <div className="dashboard__projects">

                        <div className="dashboard__section-header">

                            <div>

                                <p>
                                    RECENT_PROJECTS
                                </p>

                                <h2>
                                    Your Projects
                                </h2>

                            </div>

                        </div>

                        {projects.length === 0 ? (

                            <div className="dashboard__empty">

                                <p>
                                    No projects created yet.
                                </p>

                                <Link
                                    to="/projects"
                                    className="dashboard__projects-link"
                                >
                                    Explore Projects
                                </Link>

                            </div>

                        ) : (

                            <div className="dashboard__project-grid">

                                {projects.map(
                                    (project) => (

                                        <Link
                                            key={project._id}
                                            to={`/projects/${project._id}`}
                                            className="dashboard-project-card"
                                        >

                                            <h3>
                                                {project.title}
                                            </h3>

                                            <p className="dashboard-project-card__description">
                                                {project.description}
                                            </p>

                                            <div className="dashboard-project-card__skills">

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

                                            <div className="dashboard-project-card__footer">

                                                <span>
                                                    Team: {project.teamSize}
                                                </span>

                                                <span>
                                                    {new Date(
                                                        project.createdAt
                                                    ).toLocaleDateString()}
                                                </span>

                                            </div>

                                        </Link>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </>
            )}

        </section>
    );
};

export default DashboardPage;