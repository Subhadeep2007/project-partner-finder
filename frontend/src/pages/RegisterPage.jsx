import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { registerUser } from "../services/auth.service";

const RegisterPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});

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

        if (
            formData.name.trim().length < 2
        ) {
            newErrors.name =
                "Name must contain at least 2 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email =
                "Email is required";
        }

        const password = formData.password;

if (password.length < 8) {
    newErrors.password =
        "Password must be at least 8 characters";
} else if (!/[a-z]/.test(password)) {
    newErrors.password =
        "Password must contain at least one lowercase letter";
} else if (!/[A-Z]/.test(password)) {
    newErrors.password =
        "Password must contain at least one uppercase letter";
} else if (!/[0-9]/.test(password)) {
    newErrors.password =
        "Password must contain at least one number";
} else if (!/[^A-Za-z0-9]/.test(password)) {
    newErrors.password =
        "Password must contain at least one special character";
}

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    const handleSubmit = async(event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            setServerError("");

            await registerUser({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            navigate(
                `/verify-email?email=${encodeURIComponent(
                    formData.email.trim()
                )}`
            );

        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Join the workspace and find your next project partner."
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
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    error={errors.name}
                    required
                    disabled={isLoading}
                />

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
                    placeholder="Minimum 8 characters"
                    error={errors.password}
                    required
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading
                        ? "Creating account..."
                        : "Create Account"
                    }
                </Button>

                <p className="auth-form__footer">
                    Already have an account?{" "}

                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;