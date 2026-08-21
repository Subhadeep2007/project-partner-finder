import { registerUser, verifyEmail as verifyEmailService, resendVerificationOTP as resendVerificationOTPService, loginUser, refreshAccessToken, logoutUser, forgotPassword, resetPassword, changePassword, registerE2EEPublicKey } from "../../services/auth/auth.service.js";

const register = async(req, res, next) => {
    try {
        const user = await registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email.",
            data: user
        });
    } catch (error) {
        next(error);
    }
};
const verifyEmail = async(req, res, next) => {
    try {
        const user = await verifyEmailService(req.body);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};
const login = async(req, res, next) => {
    try {
        const result = await loginUser(req.body);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const refreshToken = async(req, res, next) => {
    try {
        const token = req.cookies.refreshToken;

        const result = await refreshAccessToken(token);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};
const resendVerificationOTP = async(req, res, next) => {
    try {
        const result = await resendVerificationOTPService(req.body.email);

        return res.status(200).json({
            success: true,
            message: "Verification OTP sent successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const logout = async(req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        await logoutUser(refreshToken);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        next(error);
    }
};

const forgotPasswordController = async(req, res, next) => {
    try {
        await forgotPassword(req.body.email);

        return res.status(200).json({
            success: true,
            message: "If the account exists, a password reset OTP has been sent."
        });
    } catch (error) {
        next(error);
    }
};

const resetPasswordController = async(req, res, next) => {
    try {
        const result = await resetPassword(req.body);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }

};
const changePasswordController = async(req, res, next) => {
    try {
        await changePassword({
            userId: req.user.userId,
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        next(error);
    }
};


const registerE2EEPublicKeyController = async(
    req,
    res,
    next
) => {
    try {
        const result =
            await registerE2EEPublicKey({
                userId: req.user.userId,
                publicKey: req.body.publicKey,
                keyVersion: req.body.keyVersion
            });

        return res.status(200).json({
            success: true,
            message: "E2EE public key registered successfully",
            data: result
        });

    } catch (error) {
        next(error);
    }
};

export {
    register,
    verifyEmail,
    resendVerificationOTP,
    login,
    refreshToken,
    logout,
    forgotPasswordController,
    resetPasswordController,
    changePasswordController,
    registerE2EEPublicKeyController

};