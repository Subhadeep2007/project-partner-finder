import api from "../api/axios";

import {
    getOrCreateUserKeys
} from "../utils/e2ee";


// ==============================
// REGISTER USER
// ==============================

const registerUser = async(
    userData
) => {

    const response =
        await api.post(
            "/auth/register",
            userData
        );

    return response.data;

};


// ==============================
// VERIFY EMAIL
// ==============================

const verifyEmail = async(
    email,
    otp
) => {

    const response =
        await api.post(
            "/auth/verify-email", {
                email,
                otp
            }
        );

    return response.data;

};


// ==============================
// RESEND VERIFICATION OTP
// ==============================

const resendVerificationOTP = async(
    email
) => {

    const response =
        await api.post(
            "/auth/resend-verification", {
                email
            }
        );

    return response.data;

};


// ==============================
// REGISTER E2EE PUBLIC KEY
// ==============================

const registerE2EEPublicKey = async(
    userId
) => {

    if (!userId) {

        throw new Error(
            "User ID is required for E2EE public key registration"
        );

    }


    const keys =
        await getOrCreateUserKeys(
            userId
        );


    const response =
        await api.post(
            "/auth/e2ee/public-key", {
                publicKey: keys.publicKey,

                keyVersion: 1
            }
        );


    return response.data;

};


// ==============================
// LOGIN
// ==============================

const loginUser = async(
    userData
) => {

    const response =
        await api.post(
            "/auth/login",
            userData
        );


    const data =
        response.data &&
        response.data.data ?
        response.data.data :
        null;


    if (!data) {

        throw new Error(
            "Invalid login response"
        );

    }


    // ==============================
    // SAVE ACCESS TOKEN
    // ==============================

    if (data.accessToken) {

        localStorage.setItem(
            "accessToken",
            data.accessToken
        );

    }


    // ==============================
    // SAVE CURRENT USER
    // ==============================

    if (data.user) {

        localStorage.setItem(
            "user",
            JSON.stringify(
                data.user
            )
        );

    }


    // ==============================
    // REGISTER E2EE PUBLIC KEY
    // ==============================

    if (
        data.user &&
        data.user.id
    ) {

        try {

            await registerE2EEPublicKey(
                data.user.id
            );

        } catch (error) {

            console.error(
                "E2EE public key registration failed:",
                error
            );

        }

    }


    return response.data;

};


// ==============================
// FORGOT PASSWORD
// ==============================

const forgotPassword = async(
    email
) => {

    const response =
        await api.post(
            "/auth/forgot-password", {
                email
            }
        );

    return response.data;

};


// ==============================
// RESET PASSWORD
// ==============================

const resetPassword = async({
    email,
    otp,
    newPassword
}) => {

    const response =
        await api.post(
            "/auth/reset-password", {
                email,
                otp,
                newPassword
            }
        );

    return response.data;

};


// ==============================
// EXPORTS
// ==============================

export {
    registerUser,
    verifyEmail,
    resendVerificationOTP,
    loginUser,
    registerE2EEPublicKey,
    forgotPassword,
    resetPassword
};