import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    registerUser
} from "../services/auth.service";


const RegisterPage = () => {

    const navigate =
        useNavigate();


    // ==========================================
    // FORM DATA
    // ==========================================

    const [formData, setFormData] =
        useState({

            name: "",

            email: "",

            password: ""

        });


    // ==========================================
    // STATE
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
    // HANDLE CHANGE
    // ==========================================

    const handleChange =
        (event) => {

            const {
                name,
                value
            } = event.target;


            setFormData(
                (previousData) => ({

                    ...previousData,

                    [name]:
                        value

                })
            );


            setErrors(
                (previousErrors) => ({

                    ...previousErrors,

                    [name]:
                        ""

                })
            );


            setServerError("");

        };


    // ==========================================
    // VALIDATE FORM
    // ==========================================

    const validateForm =
        () => {

            const newErrors =
                {};


            // NAME

            if (
                formData.name.trim().length < 2
            ) {

                newErrors.name =
                    "Name must contain at least 2 characters";

            }


            // EMAIL

            if (
                !formData.email.trim()
            ) {

                newErrors.email =
                    "Email is required";

            }


            // PASSWORD

            const password =
                formData.password;


            if (
                password.length < 8
            ) {

                newErrors.password =
                    "Password must be at least 8 characters";

            } else if (
                !/[a-z]/.test(
                    password
                )
            ) {

                newErrors.password =
                    "Password must contain at least one lowercase letter";

            } else if (
                !/[A-Z]/.test(
                    password
                )
            ) {

                newErrors.password =
                    "Password must contain at least one uppercase letter";

            } else if (
                !/[0-9]/.test(
                    password
                )
            ) {

                newErrors.password =
                    "Password must contain at least one number";

            } else if (
                !/[^A-Za-z0-9]/.test(
                    password
                )
            ) {

                newErrors.password =
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


                await registerUser({

                    name:
                        formData.name.trim(),

                    email:
                        formData.email.trim(),

                    password:
                        formData.password

                });


                navigate(
                    `/verify-email?email=${encodeURIComponent(
                        formData.email.trim()
                    )}`
                );


            } catch (error) {

                let message =
                    "Registration failed. Please try again.";


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
                            Login
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
                                lg:!min-h-[720px]
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
                                    SYSTEM.ONBOARD
                                </p>


                                <h1
                                    className="
                                        !mt-8
                                        !max-w-xl
                                        !text-5xl
                                        !font-black
                                        !leading-[1.03]
                                        !tracking-tight
                                        xl:!text-6xl
                                    "
                                >
                                    Find your
                                    people.
                                    Build your
                                    project.
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
                                    Create your profile, show your
                                    skills and connect with developers
                                    who want to build something
                                    meaningful.
                                </p>


                                {/* FEATURE CARDS */}

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
                                                Build your profile
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Show your skills and
                                                experience.
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
                                                Discover projects
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Find projects that
                                                match your skills.
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
                                                Start building
                                            </p>


                                            <p
                                                className="
                                                    !mt-1
                                                    !text-xs
                                                    !text-slate-600
                                                "
                                            >
                                                Connect with the right
                                                teammates.
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
                                $ create-account → ready
                            </p>

                        </section>


                        {/* =================================
                            REGISTER FORM
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
                                        ~/auth/register
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
                                        Create your account
                                    </h2>


                                    <p
                                        className="
                                            !mt-3
                                            !text-sm
                                            !leading-6
                                            !text-slate-500
                                        "
                                    >
                                        Join the workspace and find
                                        your next project partner.
                                    </p>

                                </div>


                                {/* SERVER ERROR */}

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

                                    {/* NAME */}

                                    <div>

                                        <label
                                            htmlFor="name"
                                            className="
                                                !mb-2
                                                !block
                                                !text-sm
                                                !font-semibold
                                                !text-slate-300
                                            "
                                        >
                                            Full Name
                                        </label>


                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={
                                                formData.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter your name"
                                            autoComplete="name"
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
                                                    errors.name
                                                        ? "!border-red-400/40 focus:!border-red-400/20 focus:!ring-red-400/10"
                                                        : "!border-white/10 focus:!border-emerald-400/30 focus:!ring-emerald-400/10"
                                                }
                                            `}
                                        />


                                        {errors.name && (

                                            <p
                                                className="
                                                    !mt-2
                                                    !mb-0
                                                    !text-xs
                                                    !text-red-300
                                                "
                                            >
                                                {
                                                    errors.name
                                                }
                                            </p>

                                        )}

                                    </div>


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
                                                formData.email
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
                                                {
                                                    errors.email
                                                }
                                            </p>

                                        )}

                                    </div>


                                    {/* PASSWORD */}

                                    <div>

                                        <label
                                            htmlFor="password"
                                            className="
                                                !mb-2
                                                !block
                                                !text-sm
                                                !font-semibold
                                                !text-slate-300
                                            "
                                        >
                                            Password
                                        </label>


                                        <div
                                            className="
                                                !relative
                                            "
                                        >

                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={
                                                    formData.password
                                                }
                                                onChange={
                                                    handleChange
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
                                                        errors.password
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


                                        {errors.password && (

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
                                                    errors.password
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
                                            Password must contain:
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


                                    {/* REGISTER BUTTON */}

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

                                                Creating account...

                                            </span>

                                        ) : (

                                            <>
                                                Create Account

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
                                        Already have an account?

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
                                    Your account will be verified by email
                                </p>

                            </div>

                        </section>

                    </div>

                </div>

            </div>

        </main>

    );

};


export default RegisterPage;