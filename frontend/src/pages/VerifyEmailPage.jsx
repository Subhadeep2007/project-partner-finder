import { useState } from "react";

import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    verifyEmail,
    resendVerificationOTP
} from "../services/auth.service";


const VerifyEmailPage = () => {

    const navigate =
        useNavigate();


    const [searchParams] =
        useSearchParams();


    const initialEmail =
        searchParams.get("email") || "";


    // ==========================================
    // STATE
    // ==========================================

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


    // ==========================================
    // VALIDATION
    // ==========================================

    const validateForm =
        () => {

            const newErrors =
                {};


            if (
                !email.trim()
            ) {

                newErrors.email =
                    "Email is required";

            }


            if (
                !/^[0-9]{6}$/.test(
                    otp
                )
            ) {

                newErrors.otp =
                    "OTP must contain exactly 6 digits";

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
    // VERIFY EMAIL
    // ==========================================

    const handleVerify =
        async(event) => {

            event.preventDefault();

            setServerError("");

            setSuccessMessage("");


            if (
                !validateForm()
            ) {

                return;

            }


            try {

                setIsVerifying(
                    true
                );


                await verifyEmail(
                    email.trim(),
                    otp
                );


                navigate(
                    "/login"
                );


            } catch (error) {

                let message =
                    "Email verification failed. Please try again.";


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

                setIsVerifying(
                    false
                );

            }

        };


    // ==========================================
    // RESEND OTP
    // ==========================================

    const handleResend =
        async() => {

            setServerError("");

            setSuccessMessage("");


            if (
                !email.trim()
            ) {

                setErrors({

                    email:
                        "Email is required"

                });

                return;

            }


            try {

                setIsResending(
                    true
                );


                const result =
                    await resendVerificationOTP(
                        email.trim()
                    );


                setSuccessMessage(
                    result.message ||
                    "Verification OTP sent successfully."
                );


            } catch (error) {

                let message =
                    "Unable to resend OTP. Please try again.";


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

                setIsResending(
                    false
                );

            }

        };


    // ==========================================
    // HANDLE EMAIL
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

            setSuccessMessage("");

        };


    // ==========================================
    // HANDLE OTP
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
                BACKGROUND GLOW
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
                        !bg-cyan-400/5
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
                            !lg:grid-cols-2
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
                                lg:!min-h-[650px]
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
                                    !bg-cyan-400/5
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
                                    SYSTEM.VERIFICATION
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
                                    One step
                                    away from
                                    your workspace.
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
                                    Verify your email address to
                                    activate your account and start
                                    connecting with project partners.
                                </p>


                                {/* STEPS */}

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
                                            ✓
                                        </span>


                                        <div>

                                            <p
                                                className="
                                                    !m-0
                                                    !text-sm
                                                    !font-bold
                                                "
                                            >
                                                Account created
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Your account is ready
                                                for verification.
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
                                                Verify email
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Enter the 6-digit OTP
                                                sent to your inbox.
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
                                                Start building
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Login and find your
                                                next project partner.
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
                                $ verify-email → pending
                            </p>

                        </section>


                        {/* =================================
                            RIGHT PANEL
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
                                        ~/auth/verify-email
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
                                        Verify your email
                                    </h2>


                                    <p
                                        className="
                                            !mt-3
                                            !text-sm
                                            !leading-6
                                            !text-slate-500
                                        "
                                    >
                                        Enter the 6-digit verification
                                        code sent to your email.
                                    </p>

                                </div>


                                {/* EMAIL BADGE */}

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
                                            Verification email
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


                                {/* ERROR */}

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


                                {/* SUCCESS */}

                                {successMessage && (

                                    <div
                                        className="
                                            !mt-5
                                            !rounded-xl
                                            !border
                                            !border-emerald-400/20
                                            !bg-emerald-400/5
                                            !px-4
                                            !py-3
                                            !text-sm
                                            !leading-6
                                            !text-emerald-300
                                        "
                                    >
                                        {successMessage}
                                    </div>

                                )}


                                {/* FORM */}

                                <form
                                    onSubmit={
                                        handleVerify
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
                                                isVerifying ||
                                                isResending
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
                                                !gap-3
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
                                                Verification OTP
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
                                                isVerifying ||
                                                isResending
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


                                    {/* VERIFY */}

                                    <button
                                        type="submit"
                                        disabled={
                                            isVerifying ||
                                            isResending
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

                                        {isVerifying ? (

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

                                                Verifying...

                                            </span>

                                        ) : (

                                            <>
                                                Verify Email

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


                                    {/* RESEND */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleResend
                                        }
                                        disabled={
                                            isVerifying ||
                                            isResending
                                        }
                                        className="
                                            !flex
                                            !h-12
                                            !w-full
                                            !items-center
                                            !justify-center
                                            !rounded-xl
                                            !border
                                            !border-white/10
                                            !bg-white/[0.03]
                                            !px-5
                                            !text-sm
                                            !font-bold
                                            !text-slate-300
                                            !transition
                                            hover:!border-emerald-400/20
                                            hover:!bg-emerald-400/5
                                            hover:!text-emerald-300
                                            disabled:!cursor-not-allowed
                                            disabled:!opacity-50
                                        "
                                    >
                                        {isResending
                                            ? "Sending OTP..."
                                            : "Resend OTP"}
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
                                        Already verified?

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
                                    Email verification secured
                                </p>

                            </div>

                        </section>

                    </div>

                </div>

            </div>

        </main>

    );

};


export default VerifyEmailPage;