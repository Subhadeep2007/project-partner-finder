import { useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import {
    resetPassword
} from "../services/auth.service";

const ResetPasswordPage = () => {
    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();

    const initialEmail =
        searchParams.get("email") || "";

    const [email, setEmail] =
        useState(initialEmail);

    const [otp, setOtp] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [errors, setErrors] =
        useState({});

    const [serverError, setServerError] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email =
                "Email is required";
        }

        if (!/^[0-9]{6}$/.test(otp)) {
            newErrors.otp =
                "OTP must contain exactly 6 digits";
        }

       if (newPassword.length < 8) {
    newErrors.newPassword =
        "Password must be at least 8 characters";
} else if (!/[a-z]/.test(newPassword)) {
    newErrors.newPassword =
        "Password must contain at least one lowercase letter";
} else if (!/[A-Z]/.test(newPassword)) {
    newErrors.newPassword =
        "Password must contain at least one uppercase letter";
} else if (!/[0-9]/.test(newPassword)) {
    newErrors.newPassword =
        "Password must contain at least one number";
} else if (!/[^A-Za-z0-9]/.test(newPassword)) {
    newErrors.newPassword =
        "Password must contain at least one special character";
}

        setErrors(newErrors);
        setServerError("");

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            setIsLoading(true);

            await resetPassword({
                email: email.trim(),
                otp,
                newPassword
            });

            navigate("/login");

        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                "Password reset failed. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Set new password"
            subtitle="Enter the OTP sent to your email and choose a new password."
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
                    onChange={(event) => {
                        setEmail(event.target.value);

                        setErrors((previous) => ({
                            ...previous,
                            email: ""
                        }));
                    }}
                    placeholder="Enter your email"
                    error={errors.email}
                    required
                    disabled={isLoading}
                />

                <Input
                    label="Reset OTP"
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(event) => {
                        const value =
                            event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);

                        setOtp(value);

                        setErrors((previous) => ({
                            ...previous,
                            otp: ""
                        }));
                    }}
                    placeholder="Enter 6-digit OTP"
                    error={errors.otp}
                    required
                    disabled={isLoading}
                />

                <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={newPassword}
                    onChange={(event) => {
                        setNewPassword(
                            event.target.value
                        );

                        setErrors((previous) => ({
                            ...previous,
                            newPassword: ""
                        }));
                    }}
                    placeholder="Minimum 8 characters"
                    error={errors.newPassword}
                    required
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading
                        ? "Resetting password..."
                        : "Reset Password"
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

export default ResetPasswordPage;