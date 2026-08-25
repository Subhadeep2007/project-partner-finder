import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    forgotPassword
} from "../services/auth.service";


const ForgotPasswordPage = () => {

    const navigate =
        useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [email, setEmail] =
        useState("");

    const [error, setError] =
        useState("");

    const [serverError, setServerError] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);


    // ==========================================
    // HANDLE CHANGE
    // ==========================================

    const handleChange =
        (event) => {

            setEmail(
                event.target.value
            );

            setError("");

            setServerError("");

        };


    // ==========================================
    // VALIDATE
    // ==========================================

    const validateForm =
        () => {

            if (
                !email.trim()
            ) {

                setError(
                    "Email is required"
                );

                return false;

            }


            setError("");

            return true;

        };


    // ==========================================
    // SUBMIT
    // ==========================================

    const handleSubmit =
        async(event) => {

            event.preventDefault();


            if (
                !validateForm()
            ) {

                return;

            }


            try {

                setIsLoading(
                    true
                );

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

                let message =
                    "Unable to process your request. Please try again.";


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
                                lg:!min-h-[620px]
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
                                        !leading-[1.05]
                                        !tracking-tight
                                        xl:!text-6xl
                                    "
                                >
                                    Recover your
                                    account safely.
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
                                    Enter your registered email
                                    and we will send you a secure
                                    OTP so you can create a new
                                    password.
                                </p>


                                {/* SECURITY FLOW */}

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
                                                !bg-emerald-400/10
                                                !font-mono
                                                !text-xs
                                                !font-bold
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
                                                Verify email
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                We'll send a password
                                                reset OTP.
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
                                                !font-mono
                                                !text-xs
                                                !font-bold
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
                                                Verify OTP
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Confirm the code sent
                                                to your email.
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
                                                !font-mono
                                                !text-xs
                                                !font-bold
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
                                                Create a new secure
                                                password.
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
                                $ security-check → ready
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
                                        ~/auth/forgot-password
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
                                        Reset your password
                                    </h2>


                                    <p
                                        className="
                                            !mt-3
                                            !text-sm
                                            !leading-6
                                            !text-slate-500
                                        "
                                    >
                                        Enter your registered email
                                        and we will send you a
                                        password reset OTP.
                                    </p>

                                </div>


                                {/* ERROR */}

                                {serverError && (

                                    <div
                                        className="
                                            !mt-6
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
                                                handleChange
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
                                                    error
                                                        ? "!border-red-400/40 focus:!border-red-400/20 focus:!ring-red-400/10"
                                                        : "!border-white/10 focus:!border-emerald-400/30 focus:!ring-emerald-400/10"
                                                }
                                            `}
                                        />


                                        {error && (

                                            <p
                                                className="
                                                    !mt-2
                                                    !mb-0
                                                    !text-xs
                                                    !text-red-300
                                                "
                                            >
                                                {error}
                                            </p>

                                        )}

                                    </div>


                                    {/* BUTTON */}

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

                                                Sending OTP...

                                            </span>

                                        ) : (

                                            <>
                                                Send Reset OTP

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


export default ForgotPasswordPage;