import api from "../api/axios";

const registerUser = async(userData) => {
    const response = await api.post(
        "/auth/register",
        userData
    );

    return response.data;
};

const verifyEmail = async(email, otp) => {
    const response = await api.post(
        "/auth/verify-email", {
            email,
            otp
        }
    );

    return response.data;
};

const resendVerificationOTP = async(email) => {
    const response = await api.post(
        "/auth/resend-verification", {
            email
        }
    );

    return response.data;
};

const loginUser = async(userData) => {
    const response = await api.post(
        "/auth/login",
        userData
    );

    return response.data;
};

const forgotPassword = async(email) => {
    const response = await api.post(
        "/auth/forgot-password", {
            email
        }
    );

    return response.data;
};

const resetPassword = async({
    email,
    otp,
    newPassword
}) => {
    const response = await api.post(
        "/auth/reset-password", {
            email,
            otp,
            newPassword
        }
    );

    return response.data;
};

export {
    registerUser,
    verifyEmail,
    resendVerificationOTP,
    loginUser,
    forgotPassword,
    resetPassword
};