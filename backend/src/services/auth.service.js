import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";
import {
    generateAccessToken,
    generateRefreshToken
} from "../../utils/generateToken.js";
const registerUser = async({ name, email, password }) => {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Generate email verification OTP
    const otp = generateOTP();

    // 4. Set OTP expiry to 10 minutes
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    // 5. Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        emailVerificationOTP: otp,
        emailVerificationOTPExpire: otpExpire
    });

    // 6. Send verification email
    await sendEmail({
        to: email,
        subject: "Verify your Project Partner Finder account",
        html: `
            <h2>Welcome to Project Partner Finder</h2>

            <p>Hello ${name},</p>

            <p>Your email verification OTP is:</p>

            <h1>${otp}</h1>

            <p>This OTP will expire in 10 minutes.</p>

            <p>If you did not create this account, you can ignore this email.</p>
        `
    });

    // 7. Return only safe information
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
    };
};


const verifyEmail = async({ email, otp }) => {
    // 1. Find user
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    // 2. Check if email is already verified
    if (user.isEmailVerified) {
        throw new Error("Email is already verified");
    }

    // 3. Check if OTP exists
    if (!user.emailVerificationOTP) {
        throw new Error("Verification OTP not found");
    }

    // 4. Check OTP expiry
    if (user.emailVerificationOTPExpire < new Date()) {
        throw new Error("Verification OTP has expired");
    }

    // 5. Compare OTP
    if (user.emailVerificationOTP !== otp) {
        throw new Error("Invalid verification OTP");
    }

    // 6. Verify email
    user.isEmailVerified = true;

    // 7. Remove used OTP
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpire = null;

    // 8. Save changes
    await user.save();

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
    };
};


const resendVerificationOTP = async(email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.isEmailVerified) {
        throw new Error("Email is already verified");
    }

    const otp = generateOTP();

    const otpExpire = new Date(
        Date.now() + 10 * 60 * 1000
    );

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpire = otpExpire;

    await user.save();

    await sendEmail({
        to: email,
        subject: "Your new verification OTP",
        html: `
            <h2>Project Partner Finder</h2>

            <p>Hello ${user.name},</p>

            <p>Your new verification OTP is:</p>

            <h1>${otp}</h1>

            <p>This OTP will expire in 10 minutes.</p>
        `
    });

    return {
        email: user.email
    };
};



const loginUser = async({ email, password }) => {
    // 1. Find user
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 2. Check account status
    if (!user.isActive) {
        throw new Error("Your account is inactive");
    }

    // 3. Check email verification
    if (!user.isEmailVerified) {
        throw new Error("Please verify your email first");
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password");
    }

    // 5. Generate tokens
    const accessToken = generateAccessToken(user._id.toString());

    const refreshToken = generateRefreshToken(user._id.toString());

    // 6. Save refresh token
    user.refreshToken = refreshToken;

    await user.save();

    // 7. Return safe user data + tokens
    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        },
        accessToken,
        refreshToken
    };
};

const refreshAccessToken = async(refreshToken) => {
    if (!refreshToken) {
        throw new Error("Refresh token not found");
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
        throw new Error("Invalid refresh token");
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (decoded.userId !== user._id.toString()) {
            throw new Error("Invalid refresh token");
        }

        const accessToken = generateAccessToken(
            user._id.toString()
        );

        return {
            accessToken
        };
    } catch (error) {
        throw new Error("Invalid or expired refresh token");
    }
};
export {
    registerUser,
    verifyEmail,
    resendVerificationOTP,
    loginUser,
    refreshAccessToken
};