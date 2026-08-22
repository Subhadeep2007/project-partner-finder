import { useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import {
    forgotPassword
} from "../services/auth.service";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] =
        useState("");

    const [error, setError] =
        useState("");

    const [serverError, setServerError] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const handleChange = (event) => {
        setEmail(event.target.value);

        setError("");
        setServerError("");
    };

    const validateForm = () => {
        if (!email.trim()) {
            setError("Email is required");

            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            setServerError("");

            await forgotPassword(
                email.trim()
            );

            navigate(
                `/reset-password?email=${encodeURIComponent(
                    email.trim()
                )}`
            );

        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your email and we will send you a password reset OTP."
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
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your registered email"
                    error={error}
                    required
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading
                        ? "Sending OTP..."
                        : "Send Reset OTP"
                    }
                </Button>

                <p className="auth-form__footer">
                    Remember your password?{" "}

                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;