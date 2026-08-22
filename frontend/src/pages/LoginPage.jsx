import { useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import {
    loginUser
} from "../services/auth.service";

const LoginPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] =
        useState({
            email: "",
            password: ""
        });

    const [errors, setErrors] =
        useState({});

    const [serverError, setServerError] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: ""
        }));

        setServerError("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email =
                "Email is required";
        }

        if (!formData.password) {
            newErrors.password =
                "Password is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            setServerError("");

            const result = await loginUser({
                email: formData.email.trim(),
                password: formData.password
            });

            /*
                IMPORTANT:

                Tumhare backend login service ke response mein
                accessToken exactly kis path par aa raha hai,
                ye response structure ke according store hoga.

                Expected common structure:
                result.data.accessToken
            */

            const accessToken =
                result.data?.accessToken;

            if (!accessToken) {
                throw new Error(
                    "Access token was not received"
                );
            }

            localStorage.setItem(
                "accessToken",
                accessToken
            );

            navigate("/dashboard");

        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your credentials to access your workspace."
        >
            <form
                className="auth-form"
                onSubmit={handleSubmit}
            >
                {serverError && (
                    <p className="auth-form__error">
                        {serverError}
                    </p>
                )}

                <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    error={errors.email}
                    required
                    disabled={isLoading}
                />

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    error={errors.password}
                    required
                    disabled={isLoading}
                />

                <div className="auth-form__link-row">
                    <Link to="/forgot-password">
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading
                        ? "Logging in..."
                        : "Login"
                    }
                </Button>

                <p className="auth-form__footer">
                    Don't have an account?{" "}

                    <Link to="/register">
                        Create account
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;