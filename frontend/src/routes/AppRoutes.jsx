import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import EditProjectPage from "../pages/EditProjectPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectDetailsPage from "../pages/ProjectDetailsPage";
import NotificationsPage from "../pages/NotificationsPage";
import AppLayout from "../components/layout/AppLayout";
import NotFoundPage from "../pages/NotFoundPage";
import CreateProjectPage from "../pages/CreateProjectPage";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}

            <Route
                path="/"
                element={<HomePage />}
            />

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/register"
                element={<RegisterPage />}
            />

            <Route
                path="/verify-email"
                element={<VerifyEmailPage />}
            />

            <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
            />

            <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
            />

            {/* Protected Routes */}

<Route element={<ProtectedRoute />}>

    <Route element={<AppLayout />}>

        <Route
            path="/dashboard"
            element={<DashboardPage />}
        />

        <Route
            path="/profile"
            element={<ProfilePage />}
        />

        <Route
            path="/projects"
            element={<ProjectsPage />}
        />
<Route
    path="/projects/create"
    element={<CreateProjectPage />}
/>

<Route
    path="/projects/:projectId/edit"
    element={<EditProjectPage />}
/>
        <Route
            path="/projects/:projectId"
            element={<ProjectDetailsPage />}
        />

        <Route
            path="/notifications"
            element={<NotificationsPage />}
        />

    </Route>

</Route>
            {/* 404 Route */}

            <Route
                path="*"
                element={<NotFoundPage />}
            />
        </Routes>



    );
};

export default AppRoutes;