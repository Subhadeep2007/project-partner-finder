import { useState } from "react";

import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    resetPassword
} from "../services/auth.service";


const ResetPasswordPage = () => {

    const navigate =
        useNavigate();


    const [searchParams] =
        useSearchParams();


    const initialEmail =
        searchParams.get("email") || "";


    // ==========================================
    // FORM STATE
    // ==========================================

    const [email, setEmail] =
        useState(initialEmail);

    const [otp, setOtp] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");


    // ==========================================
    // UI STATE
    // ==========================================

    const [errors, setErrors] =
        useState({});

    const [serverError, setServerError] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);


    // ==========================================
    // VALIDATION
    // ==========================================

    const validateForm =
        () => {

            const newErrors =
                {};


            // EMAIL

            if (
                !email.trim()
            ) {

                newErrors.email =
                    "Email is required";

            }


            // OTP

            if (
                !/^[0-9]{6}$/.test(
                    otp
                )
            ) {

                newErrors.otp =
                    "OTP must contain exactly 6 digits";

            }


            // PASSWORD

            if (
                newPassword.length < 8
            ) {

                newErrors.newPassword =
                    "Password must be at least 8 characters";

            } else if (
                !/[a-z]/.test(
                    newPassword
                )
            ) {

                newErrors.newPassword =
                    "Password must contain at least one lowercase letter";

            } else if (
                !/[A-Z]/.test(
                    newPassword
                )
            ) {

                newErrors.newPassword =
                    "Password must contain at least one uppercase letter";

            } else if (
                !/[0-9]/.test(
                    newPassword
                )
            ) {

                newErrors.newPassword =
                    "Password must contain at least one number";

            } else if (
                !/[^A-Za-z0-9]/.test(
                    newPassword
                )
            ) {

                newErrors.newPassword =
                    "Password must contain at least one special character";

            }


            setErrors(
                newErrors
            );


            return (
                Object.keys(
                    newErrors
                ).length === 0
            );

        };


    // ==========================================
    // HANDLE SUBMIT
    // ==========================================

    const handleSubmit =
        async(event) => {

            event.preventDefault();


            setServerError("");


            if (
                !validateForm()
            ) {

                return;

            }


            try {

                setIsLoading(
                    true
                );


                await resetPassword({

                    email:
                        email.trim(),

                    otp,

                    newPassword

                });


                navigate(
                    "/login"
                );


            } catch (error) {

                let message =
                    "Password reset failed. Please try again.";


                if (
                    error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    message =
                        error.response.data.message;

                }


                setServerError(
                    message
                );


            } finally {

                setIsLoading(
                    false
                );

            }

        };


    // ==========================================
    // EMAIL CHANGE
    // ==========================================

    const handleEmailChange =
        (event) => {

            setEmail(
                event.target.value
            );


            setErrors(
                (previous) => ({

                    ...previous,

                    email:
                        ""

                })
            );


            setServerError("");

        };


    // ==========================================
    // OTP CHANGE
    // ==========================================

    const handleOtpChange =
        (event) => {

            const value =
                event.target.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        6
                    );


            setOtp(
                value
            );


            setErrors(
                (previous) => ({

                    ...previous,

                    otp:
                        ""

                })
            );


            setServerError("");

        };


    // ==========================================
    // PASSWORD CHANGE
    // ==========================================

    const handlePasswordChange =
        (event) => {

            setNewPassword(
                event.target.value
            );


            setErrors(
                (previous) => ({

                    ...previous,

                    newPassword:
                        ""

                })
            );


            setServerError("");

        };


    return (

        <main
            className="
                !min-h-screen
                !w-full
                !overflow-x-hidden
                !bg-[#060a0f]
                !text-white
            "
        >

            {/* ==========================================
                BACKGROUND
            ========================================== */}

            <div
                className="
                    !pointer-events-none
                    !fixed
                    !inset-0
                    !overflow-hidden
                "
            >

                <div
                    className="
                        !absolute
                        !-right-32
                        !-top-32
                        !h-96
                        !w-96
                        !rounded-full
                        !bg-emerald-400/10
                        !blur-3xl
                    "
                />


                <div
                    className="
                        !absolute
                        !-bottom-40
                        !-left-40
                        !h-96
                        !w-96
                        !rounded-full
                        !bg-purple-400/5
                        !blur-3xl
                    "
                />

            </div>


            {/* ==========================================
                PAGE
            ========================================== */}

            <div
                className="
                    !relative
                    !z-10
                    !mx-auto
                    !flex
                    !min-h-screen
                    !w-full
                    !max-w-7xl
                    !items-center
                    !justify-center
                    !px-4
                    !py-6
                    sm:!px-6
                    sm:!py-10
                    lg:!px-8
                "
            >

                <div
                    className="
                        !w-full
                        !max-w-5xl
                        !overflow-hidden
                        !rounded-3xl
                        !border
                        !border-white/10
                        !bg-[#0b1117]
                        !shadow-[0_30px_100px_rgba(0,0,0,0.45)]
                    "
                >

                    {/* ==================================
                        TOP BAR
                    ================================== */}

                    <header
                        className="
                            !flex
                            !items-center
                            !justify-between
                            !border-b
                            !border-white/10
                            !px-5
                            !py-4
                            sm:!px-7
                        "
                    >

                        <Link
                            to="/"
                            className="
                                !flex
                                !items-center
                                !gap-3
                                !no-underline
                            "
                        >

                            <span
                                className="
                                    !flex
                                    !h-10
                                    !w-10
                                    !items-center
                                    !justify-center
                                    !rounded-xl
                                    !border
                                    !border-emerald-400/30
                                    !bg-emerald-400/5
                                    !font-mono
                                    !text-sm
                                    !font-black
                                    !text-emerald-400
                                "
                            >
                                &gt;_
                            </span>


                            <span
                                className="
                                    !font-mono
                                    !text-sm
                                    !font-bold
                                    !tracking-wide
                                    !text-emerald-400
                                    sm:!text-base
                                "
                            >
                                PROJECT_PARTNER_FINDER
                            </span>

                        </Link>


                        <Link
                            to="/login"
                            className="
                                !text-xs
                                !font-semibold
                                !text-slate-500
                                !no-underline
                                !transition
                                hover:!text-white
                            "
                        >
                            Back to Login
                        </Link>

                    </header>


                    {/* ==================================
                        CONTENT
                    ================================== */}

                    <div
                        className="
                            !grid
                            lg:!grid-cols-2
                        "
                    >

                        {/* =================================
                            LEFT PANEL
                        ================================= */}

                        <section
                            className="
                                !relative
                                !hidden
                                !overflow-hidden
                                !border-r
                                !border-white/10
                                !bg-[#0d151d]
                                !p-8
                                lg:!flex
                                lg:!min-h-[700px]
                                lg:!flex-col
                                lg:!justify-between
                                lg:!p-12
                            "
                        >

                            <div
                                className="
                                    !pointer-events-none
                                    !absolute
                                    !-right-24
                                    !-top-24
                                    !h-72
                                    !w-72
                                    !rounded-full
                                    !bg-emerald-400/10
                                    !blur-3xl
                                "
                            />


                            <div
                                className="
                                    !pointer-events-none
                                    !absolute
                                    !-bottom-24
                                    !-left-24
                                    !h-72
                                    !w-72
                                    !rounded-full
                                    !bg-purple-400/5
                                    !blur-3xl
                                "
                            />


                            <div
                                className="
                                    !relative
                                    !z-10
                                "
                            >

                                <p
                                    className="
                                        !m-0
                                        !font-mono
                                        !text-xs
                                        !font-bold
                                        !uppercase
                                        !tracking-[0.25em]
                                        !text-emerald-400
                                    "
                                >
                                    SYSTEM.SECURITY
                                </p>


                                <h1
                                    className="
                                        !mt-8
                                        !max-w-xl
                                        !text-5xl
                                        !font-black
                                        !leading-[1.04]
                                        !tracking-tight
                                        xl:!text-6xl
                                    "
                                >
                                    Create a new
                                    password.
                                </h1>


                                <p
                                    className="
                                        !mt-6
                                        !max-w-lg
                                        !text-sm
                                        !leading-7
                                        !text-slate-500
                                    "
                                >
                                    Use the OTP sent to your email
                                    and create a strong password to
                                    secure your Project Partner Finder
                                    account.
                                </p>


                                {/* SECURITY STEPS */}

                                <div
                                    className="
                                        !mt-10
                                        !space-y-3
                                    "
                                >

                                    <div
                                        className="
                                            !flex
                                            !items-center
                                            !gap-4
                                            !rounded-2xl
                                            !border
                                            !border-emerald-400/20
                                            !bg-emerald-400/[0.04]
                                            !p-4
                                        "
                                    >

                                        <span
                                            className="
                                                !flex
                                                !h-10
                                                !w-10
                                                !shrink-0
                                                !items-center
                                                !justify-center
                                                !rounded-xl
                                                !bg-emerald-400/10
                                                !font-black
                                                !text-emerald-300
                                            "
                                        >
                                            01
                                        </span>


                                        <div>

                                            <p
                                                className="
                                                    !m-0
                                                    !text-sm
                                                    !font-bold
                                                "
                                            >
                                                Confirm your email
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Use the email linked
                                                to your account.
                                            </p>

                                        </div>

                                    </div>


                                    <div
                                        className="
                                            !flex
                                            !items-center
                                            !gap-4
                                            !rounded-2xl
                                            !border
                                            !border-white/10
                                            !bg-white/[0.02]
                                            !p-4
                                        "
                                    >

                                        <span
                                            className="
                                                !flex
                                                !h-10
                                                !w-10
                                                !shrink-0
                                                !items-center
                                                !justify-center
                                                !rounded-xl
                                                !bg-cyan-400/10
                                                !font-black
                                                !text-cyan-300
                                            "
                                        >
                                            02
                                        </span>


                                        <div>

                                            <p
                                                className="
                                                    !m-0
                                                    !text-sm
                                                    !font-bold
                                                "
                                            >
                                                Enter reset OTP
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Enter the 6-digit
                                                verification code.
                                            </p>

                                        </div>

                                    </div>


                                    <div
                                        className="
                                            !flex
                                            !items-center
                                            !gap-4
                                            !rounded-2xl
                                            !border
                                            !border-white/10
                                            !bg-white/[0.02]
                                            !p-4
                                        "
                                    >

                                        <span
                                            className="
                                                !flex
                                                !h-10
                                                !w-10
                                                !shrink-0
                                                !items-center
                                                !justify-center
                                                !rounded-xl
                                                !bg-purple-400/10
                                                !font-black
                                                !text-purple-300
                                            "
                                        >
                                            03
                                        </span>


                                        <div>

                                            <p
                                                className="
                                                    !m-0
                                                    !text-sm
                                                    !font-bold
                                                "
                                            >
                                                Set new password
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Protect your account
                                                with a strong password.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <p
                                className="
                                    !relative
                                    !z-10
                                    !m-0
                                    !font-mono
                                    !text-[10px]
                                    !text-slate-700
                                "
                            >
                                $ reset-password → ready
                            </p>

                        </section>


                        {/* =================================
                            RIGHT FORM
                        ================================= */}

                        <section
                            className="
                                !flex
                                !items-center
                                !justify-center
                                !p-6
                                sm:!p-10
                                lg:!p-12
                            "
                        >

                            <div
                                className="
                                    !w-full
                                    !max-w-md
                                "
                            >

                                {/* MOBILE BRAND */}

                                <div
                                    className="
                                        !mb-8
                                        lg:!hidden
                                    "
                                >

                                    <p
                                        className="
                                            !m-0
                                            !font-mono
                                            !text-[10px]
                                            !font-bold
                                            !uppercase
                                            !tracking-[0.25em]
                                            !text-slate-600
                                        "
                                    >
                                        PROJECT
                                    </p>


                                    <p
                                        className="
                                            !m-0
                                            !text-2xl
                                            !font-black
                                            !text-emerald-400
                                        "
                                    >
                                        FINDER
                                    </p>

                                </div>


                                {/* HEADER */}

                                <div>

                                    <p
                                        className="
                                            !m-0
                                            !font-mono
                                            !text-xs
                                            !font-bold
                                            !uppercase
                                            !tracking-[0.2em]
                                            !text-emerald-400
                                        "
                                    >
                                        ~/auth/reset-password
                                    </p>


                                    <h2
                                        className="
                                            !mt-4
                                            !text-3xl
                                            !font-black
                                            !tracking-tight
                                            sm:!text-4xl
                                        "
                                    >
                                        Set new password
                                    </h2>


                                    <p
                                        className="
                                            !mt-3
                                            !text-sm
                                            !leading-6
                                            !text-slate-500
                                        "
                                    >
                                        Enter the OTP sent to your
                                        email and choose a new password.
                                    </p>

                                </div>


                                {/* EMAIL */}

                                {email && (

                                    <div
                                        className="
                                            !mt-6
                                            !rounded-xl
                                            !border
                                            !border-white/10
                                            !bg-white/[0.02]
                                            !px-4
                                            !py-3
                                        "
                                    >

                                        <p
                                            className="
                                                !m-0
                                                !text-[10px]
                                                !font-bold
                                                !uppercase
                                                !tracking-wider
                                                !text-slate-600
                                            "
                                        >
                                            Account email
                                        </p>


                                        <p
                                            className="
                                                !mt-1
                                                !truncate
                                                !text-sm
                                                !font-semibold
                                                !text-slate-300
                                            "
                                        >
                                            {email}
                                        </p>

                                    </div>

                                )}


                                {/* SERVER ERROR */}

                                {serverError && (

                                    <div
                                        className="
                                            !mt-5
                                            !rounded-xl
                                            !border
                                            !border-red-400/20
                                            !bg-red-400/5
                                            !px-4
                                            !py-3
                                            !text-sm
                                            !leading-6
                                            !text-red-300
                                        "
                                    >
                                        {serverError}
                                    </div>

                                )}


                                {/* FORM */}

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                    className="
                                        !mt-7
                                        !space-y-5
                                    "
                                >

                                    {/* EMAIL */}

                                    <div>

                                        <label
                                            htmlFor="email"
                                            className="
                                                !mb-2
                                                !block
                                                !text-sm
                                                !font-semibold
                                                !text-slate-300
                                            "
                                        >
                                            Email
                                        </label>


                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={
                                                email
                                            }
                                            onChange={
                                                handleEmailChange
                                            }
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            disabled={
                                                isLoading
                                            }
                                            className={`
                                                !h-12
                                                !w-full
                                                !rounded-xl
                                                !border
                                                !bg-[#0a1016]
                                                !px-4
                                                !text-sm
                                                !text-white
                                                !outline-none
                                                !transition
                                                placeholder:!text-slate-700
                                                focus:!ring-2
                                                ${
                                                    errors.email
                                                        ? "!border-red-400/40 focus:!border-red-400/20 focus:!ring-red-400/10"
                                                        : "!border-white/10 focus:!border-emerald-400/30 focus:!ring-emerald-400/10"
                                                }
                                            `}
                                        />


                                        {errors.email && (

                                            <p
                                                className="
                                                    !mt-2
                                                    !mb-0
                                                    !text-xs
                                                    !text-red-300
                                                "
                                            >
                                                {errors.email}
                                            </p>

                                        )}

                                    </div>


                                    {/* OTP */}

                                    <div>

                                        <div
                                            className="
                                                !mb-2
                                                !flex
                                                !items-center
                                                !justify-between
                                            "
                                        >

                                            <label
                                                htmlFor="otp"
                                                className="
                                                    !text-sm
                                                    !font-semibold
                                                    !text-slate-300
                                                "
                                            >
                                                Reset OTP
                                            </label>


                                            <span
                                                className="
                                                    !font-mono
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                {otp.length}/6
                                            </span>

                                        </div>


                                        <input
                                            id="otp"
                                            type="text"
                                            name="otp"
                                            inputMode="numeric"
                                            maxLength="6"
                                            value={
                                                otp
                                            }
                                            onChange={
                                                handleOtpChange
                                            }
                                            placeholder="000000"
                                            autoComplete="one-time-code"
                                            disabled={
                                                isLoading
                                            }
                                            className={`
                                                !h-14
                                                !w-full
                                                !rounded-xl
                                                !border
                                                !bg-[#0a1016]
                                                !px-4
                                                !text-center
                                                !font-mono
                                                !text-2xl
                                                !font-bold
                                                !tracking-[0.45em]
                                                !text-white
                                                !outline-none
                                                !transition
                                                placeholder:!text-slate-700
                                                focus:!ring-2
                                                ${
                                                    errors.otp
                                                        ? "!border-red-400/40 focus:!border-red-400/20 focus:!ring-red-400/10"
                                                        : "!border-white/10 focus:!border-emerald-400/30 focus:!ring-emerald-400/10"
                                                }
                                            `}
                                        />


                                        {errors.otp && (

                                            <p
                                                className="
                                                    !mt-2
                                                    !mb-0
                                                    !text-xs
                                                    !text-red-300
                                                "
                                            >
                                                {errors.otp}
                                            </p>

                                        )}

                                    </div>


                                    {/* NEW PASSWORD */}

                                    <div>

                                        <label
                                            htmlFor="newPassword"
                                            className="
                                                !mb-2
                                                !block
                                                !text-sm
                                                !font-semibold
                                                !text-slate-300
                                            "
                                        >
                                            New Password
                                        </label>


                                        <div
                                            className="
                                                !relative
                                            "
                                        >

                                            <input
                                                id="newPassword"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="newPassword"
                                                value={
                                                    newPassword
                                                }
                                                onChange={
                                                    handlePasswordChange
                                                }
                                                placeholder="Minimum 8 characters"
                                                autoComplete="new-password"
                                                disabled={
                                                    isLoading
                                                }
                                                className={`
                                                    !h-12
                                                    !w-full
                                                    !rounded-xl
                                                    !border
                                                    !bg-[#0a1016]
                                                    !pl-4
                                                    !pr-12
                                                    !text-sm
                                                    !text-white
                                                    !outline-none
                                                    !transition
                                                    placeholder:!text-slate-700
                                                    focus:!ring-2
                                                    ${
                                                        errors.newPassword
                                                            ? "!border-red-400/40 focus:!border-red-400/20 focus:!ring-red-400/10"
                                                            : "!border-white/10 focus:!border-emerald-400/30 focus:!ring-emerald-400/10"
                                                    }
                                                `}
                                            />


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className="
                                                    !absolute
                                                    !right-1
                                                    !top-1/2
                                                    !flex
                                                    !h-10
                                                    !w-10
                                                    !-translate-y-1/2
                                                    !items-center
                                                    !justify-center
                                                    !rounded-lg
                                                    !text-slate-600
                                                    !transition
                                                    hover:!bg-white/5
                                                    hover:!text-emerald-300
                                                "
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {
                                                    showPassword
                                                        ? "◉"
                                                        : "○"
                                                }
                                            </button>

                                        </div>


                                        {errors.newPassword && (

                                            <p
                                                className="
                                                    !mt-2
                                                    !mb-0
                                                    !text-xs
                                                    !leading-5
                                                    !text-red-300
                                                "
                                            >
                                                {
                                                    errors.newPassword
                                                }
                                            </p>

                                        )}

                                    </div>


                                    {/* PASSWORD REQUIREMENTS */}

                                    <div
                                        className="
                                            !rounded-2xl
                                            !border
                                            !border-white/10
                                            !bg-white/[0.02]
                                            !p-4
                                        "
                                    >

                                        <p
                                            className="
                                                !m-0
                                                !text-xs
                                                !font-bold
                                                !text-slate-400
                                            "
                                        >
                                            New password must contain:
                                        </p>


                                        <div
                                            className="
                                                !mt-3
                                                !grid
                                                !grid-cols-1
                                                !gap-2
                                                sm:!grid-cols-2
                                            "
                                        >

                                            <p
                                                className="
                                                    !m-0
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                • 8+ characters
                                            </p>


                                            <p
                                                className="
                                                    !m-0
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                • Lowercase letter
                                            </p>


                                            <p
                                                className="
                                                    !m-0
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                • Uppercase letter
                                            </p>


                                            <p
                                                className="
                                                    !m-0
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                • One number
                                            </p>


                                            <p
                                                className="
                                                    !m-0
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                • Special character
                                            </p>

                                        </div>

                                    </div>


                                    {/* RESET BUTTON */}

                                    <button
                                        type="submit"
                                        disabled={
                                            isLoading
                                        }
                                        className="
                                            !flex
                                            !h-12
                                            !w-full
                                            !items-center
                                            !justify-center
                                            !rounded-xl
                                            !border
                                            !border-emerald-400/20
                                            !bg-emerald-400
                                            !px-5
                                            !text-sm
                                            !font-black
                                            !text-black
                                            !transition
                                            hover:!bg-emerald-300
                                            disabled:!cursor-not-allowed
                                            disabled:!opacity-50
                                        "
                                    >

                                        {isLoading ? (

                                            <span
                                                className="
                                                    !flex
                                                    !items-center
                                                    !gap-2
                                                "
                                            >

                                                <span
                                                    className="
                                                        !h-4
                                                        !w-4
                                                        !animate-spin
                                                        !rounded-full
                                                        !border-2
                                                        !border-black/20
                                                        !border-t-black
                                                    "
                                                />

                                                Resetting password...

                                            </span>

                                        ) : (

                                            <>
                                                Reset Password

                                                <span
                                                    className="
                                                        !ml-2
                                                    "
                                                >
                                                    →
                                                </span>
                                            </>

                                        )}

                                    </button>

                                </form>


                                {/* LOGIN */}

                                <div
                                    className="
                                        !mt-7
                                        !border-t
                                        !border-white/10
                                        !pt-6
                                        !text-center
                                    "
                                >

                                    <p
                                        className="
                                            !m-0
                                            !text-sm
                                            !text-slate-600
                                        "
                                    >
                                        Remember your password?

                                        <Link
                                            to="/login"
                                            className="
                                                !ml-1
                                                !font-bold
                                                !text-emerald-400
                                                !no-underline
                                                hover:!text-emerald-300
                                            "
                                        >
                                            Login
                                        </Link>

                                    </p>

                                </div>


                                <p
                                    className="
                                        !mt-6
                                        !text-center
                                        !font-mono
                                        !text-[10px]
                                        !text-slate-700
                                    "
                                >
                                    Secure password recovery
                                </p>

                            </div>

                        </section>

                    </div>

                </div>

            </div>

        </main>

    );

};


export default ResetPasswordPage;