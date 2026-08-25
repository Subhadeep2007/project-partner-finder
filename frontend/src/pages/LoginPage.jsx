import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    loginUser
} from "../services/auth.service";


const LoginPage = () => {

    const navigate =
        useNavigate();


    // ==========================================
    // FORM DATA
    // ==========================================

    const [formData, setFormData] =
        useState({

            email: "",

            password: ""

        });


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
    // HANDLE INPUT
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
    // VALIDATION
    // ==========================================

    const validateForm =
        () => {

            const newErrors =
                {};


            if (
                !formData.email.trim()
            ) {

                newErrors.email =
                    "Email is required";

            }


            if (
                !formData.password
            ) {

                newErrors.password =
                    "Password is required";

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
    // LOGIN
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


                const result =
                    await loginUser({

                        email:
                            formData.email.trim(),

                        password:
                            formData.password

                    });


                const accessToken =
                    result.data &&
                    result.data.accessToken;


                if (!accessToken) {

                    throw new Error(
                        "Access token was not received"
                    );

                }


                localStorage.setItem(
                    "accessToken",
                    accessToken
                );


                if (
                    result.data &&
                    result.data.user
                ) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            result.data.user
                        )
                    );

                }


                navigate(
                    "/dashboard"
                );


            } catch (error) {

                let message =
                    "Login failed. Please try again.";


                if (
                    error &&
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    message =
                        error.response.data.message;

                } else if (
                    error &&
                    error.message
                ) {

                    message =
                        error.message;

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
                        HEADER
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
                            to="/"
                            className="
                                !text-xs
                                !font-semibold
                                !text-slate-500
                                !no-underline
                                !transition
                                hover:!text-white
                            "
                        >
                            Home
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
                            LEFT SIDE
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
                                lg:!min-h-[680px]
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
                                    SYSTEM.AUTH
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
                                    Build great
                                    things with
                                    the right team.
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
                                    Project Partner Finder helps
                                    developers discover projects,
                                    connect with teammates and
                                    build something meaningful
                                    together.
                                </p>


                                {/* TERMINAL */}

                                <div
                                    className="
                                        !mt-10
                                        !rounded-2xl
                                        !border
                                        !border-white/10
                                        !bg-[#070b10]
                                        !p-4
                                    "
                                >

                                    <div
                                        className="
                                            !flex
                                            !items-center
                                            !gap-2
                                        "
                                    >

                                        <span
                                            className="
                                                !h-2.5
                                                !w-2.5
                                                !rounded-full
                                                !bg-red-400/70
                                            "
                                        />

                                        <span
                                            className="
                                                !h-2.5
                                                !w-2.5
                                                !rounded-full
                                                !bg-yellow-400/70
                                            "
                                        />

                                        <span
                                            className="
                                                !h-2.5
                                                !w-2.5
                                                !rounded-full
                                                !bg-emerald-400/70
                                            "
                                        />

                                    </div>


                                    <p
                                        className="
                                            !mt-4
                                            !font-mono
                                            !text-xs
                                            !text-slate-600
                                        "
                                    >
                                        $ connect --workspace
                                    </p>


                                    <p
                                        className="
                                            !mt-2
                                            !font-mono
                                            !text-xs
                                            !text-emerald-400
                                        "
                                    >
                                        ✓ secure workspace ready
                                    </p>

                                </div>

                            </div>


                            {/* STATS */}

                            <div
                                className="
                                    !relative
                                    !z-10
                                    !grid
                                    !grid-cols-3
                                    !gap-3
                                "
                            >

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
                                            !text-2xl
                                            !font-black
                                        "
                                    >
                                        01
                                    </p>


                                    <p
                                        className="
                                            !mt-1
                                            !text-[10px]
                                            !uppercase
                                            !tracking-wider
                                            !text-slate-600
                                        "
                                    >
                                        Discover
                                    </p>

                                </div>


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
                                            !text-2xl
                                            !font-black
                                        "
                                    >
                                        02
                                    </p>


                                    <p
                                        className="
                                            !mt-1
                                            !text-[10px]
                                            !uppercase
                                            !tracking-wider
                                            !text-slate-600
                                        "
                                    >
                                        Connect
                                    </p>

                                </div>


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
                                            !text-2xl
                                            !font-black
                                        "
                                    >
                                        03
                                    </p>


                                    <p
                                        className="
                                            !mt-1
                                            !text-[10px]
                                            !uppercase
                                            !tracking-wider
                                            !text-slate-600
                                        "
                                    >
                                        Build
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* =================================
                            RIGHT LOGIN FORM
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


                                {/* TITLE */}

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
                                        ~/auth/login
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
                                        Welcome back
                                    </h2>


                                    <p
                                        className="
                                            !mt-3
                                            !text-sm
                                            !leading-6
                                            !text-slate-500
                                        "
                                    >
                                        Sign in to continue to
                                        your workspace.
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
                                                htmlFor="password"
                                                className="
                                                    !text-sm
                                                    !font-semibold
                                                    !text-slate-300
                                                "
                                            >
                                                Password
                                            </label>


                                            <Link
                                                to="/forgot-password"
                                                className="
                                                    !text-xs
                                                    !font-semibold
                                                    !text-emerald-400
                                                    !no-underline
                                                    hover:!text-emerald-300
                                                "
                                            >
                                                Forgot password?
                                            </Link>

                                        </div>


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
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
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
                                                    !text-red-300
                                                "
                                            >
                                                {
                                                    errors.password
                                                }
                                            </p>

                                        )}

                                    </div>


                                    {/* LOGIN BUTTON */}

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

                                                Logging in...

                                            </span>

                                        ) : (

                                            <>
                                                Login

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


                                {/* REGISTER */}

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
                                        Don't have an account?

                                        <Link
                                            to="/register"
                                            className="
                                                !ml-1
                                                !font-bold
                                                !text-emerald-400
                                                !no-underline
                                                hover:!text-emerald-300
                                            "
                                        >
                                            Create account
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
                                    Secure workspace access
                                </p>

                            </div>

                        </section>

                    </div>

                </div>

            </div>

        </main>

    );

};


export default LoginPage;