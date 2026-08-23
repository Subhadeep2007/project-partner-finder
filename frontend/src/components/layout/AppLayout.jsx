import {
    NavLink,
    Outlet
} from "react-router-dom";

const AppLayout = () => {
    return (
        <div className="app-layout">

            {/* Sidebar */}
            <aside className="app-sidebar">

                <div className="app-sidebar__logo">
                    <span>PROJECT</span>
                    <strong>FINDER</strong>
                </div>

                <nav className="app-sidebar__nav">

                    <NavLink
                        to="/dashboard"
                        className="app-nav-link"
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/projects"
                        className="app-nav-link"
                    >
                        Projects
                    </NavLink>

                    <NavLink
                        to="/notifications"
                        className="app-nav-link"
                    >
                        Notifications
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className="app-nav-link"
                    >
                        Profile
                    </NavLink>

                </nav>

            </aside>

            {/* Main Content */}
            <main className="app-main">
                <Outlet />
            </main>

        </div>
    );
};

export default AppLayout;