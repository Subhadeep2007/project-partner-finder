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
    verifyEmail,
    resendVerificationOTP
} from "../services/auth.service";

const VerifyEmailPage = () => {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const initialEmail =
        searchParams.get("email") || "";

    const [email, setEmail] =
        useState(initialEmail);

    const [otp, setOtp] =
        useState("");

    const [errors, setErrors] =
        useState({});

    const [serverError, setServerError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    const [isVerifying, setIsVerifying] =
        useState(false);

    const [isResending, setIsResending] =
        useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email =
                "Email is required";
        }

        if (!/^[0-9]{6}$/.test(otp)) {
            newErrors.otp =
                "OTP must contain exactly 6 digits";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleVerify = async(event) => {
        event.preventDefault();

        setServerError("");
        setSuccessMessage("");

        if (!validateForm()) {
            return;
        }

        try {
            setIsVerifying(true);

            await verifyEmail(
                email.trim(),
                otp
            );

            navigate("/login");

        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                "Email verification failed. Please try again."
            );
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async() => {
        setServerError("");
        setSuccessMessage("");

        if (!email.trim()) {
            setErrors({
                email: "Email is required"
            });

            return;
        }

        try {
            setIsResending(true);

            const result =
                await resendVerificationOTP(
                    email.trim()
                );

            setSuccessMessage(
                result.message ||
                "Verification OTP sent successfully."
            );

        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                "Unable to resend OTP. Please try again."
            );
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="Enter the 6-digit verification code sent to your email."
        >
            <form
                className="auth-form"
                onSubmit={handleVerify}
            >
                {serverError && (
                    <p className="auth-form__error">
                        {serverError}
                    </p>
                )}

                {successMessage && (
                    <p className="auth-form__success">
                        {successMessage}
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
                    disabled={
                        isVerifying ||
                        isResending
                    }
                />

                <Input
                    label="Verification OTP"
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
                    disabled={
                        isVerifying ||
                        isResending
                    }
                />

                <Button
                    type="submit"
                    disabled={
                        isVerifying ||
                        isResending
                    }
                >
                    {isVerifying
                        ? "Verifying..."
                        : "Verify Email"}
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResend}
                    disabled={
                        isVerifying ||
                        isResending
                    }
                >
                    {isResending
                        ? "Sending OTP..."
                        : "Resend OTP"}
                </Button>

                <p className="auth-form__footer">
                    Already verified?{" "}

                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default VerifyEmailPage;