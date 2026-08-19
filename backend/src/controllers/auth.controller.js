import { registerUser, verifyEmail as verifyEmailService, resendVerificationOTP as resendVerificationOTPService } from "../../services/auth.service.js";

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
export {
    register,
    verifyEmail,
    resendVerificationOTP
};