import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import generateOTP from "../../utils/generateOTP.js";
import sendEmail from "../../utils/sendEmail.js";
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

    // 3. Check password BEFORE email verification
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password");
    }

    // 4. Check email verification
    if (!user.isEmailVerified) {
        const otp = generateOTP();

        const otpExpire = new Date(
            Date.now() + 10 * 60 * 1000
        );

        user.emailVerificationOTP = otp;
        user.emailVerificationOTPExpire = otpExpire;

        await user.save();

        await sendEmail({
            to: user.email,
            subject: "Verify your Project Partner Finder account",
            html: `
                <h2>Project Partner Finder</h2>

                <p>Hello ${user.name},</p>

                <p>Your email verification OTP is:</p>

                <h1>${otp}</h1>

                <p>This OTP will expire in 10 minutes.</p>

                <p>
                    Please enter this OTP on the email verification page
                    to activate your account.
                </p>
            `
        });

        return {
            requiresEmailVerification: true,
            email: user.email
        };
    }

    // 5. Generate tokens
    const accessToken = generateAccessToken(
        user._id.toString()
    );

    const refreshToken = generateRefreshToken(
        user._id.toString()
    );

    // 6. Save refresh token
    user.refreshToken = refreshToken;

    await user.save();

    // 7. Return safe user data + tokens
    return {
        requiresEmailVerification: false,
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
            process.env.JWT_SECRET
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


const logoutUser = async(refreshToken) => {
    if (!refreshToken) {
        return;
    }

    await User.findOneAndUpdate({ refreshToken }, {
        $set: {
            refreshToken: null
        }
    });
};

const forgotPassword = async(email) => {
    const user = await User.findOne({ email });

    if (!user) {
        return;
    }

    if (!user.isActive) {
        return;
    }

    const otp = generateOTP();

    const otpExpire = new Date(
        Date.now() + 10 * 60 * 1000
    );

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = otpExpire;

    await user.save();

    await sendEmail({
        to: email,
        subject: "Password reset OTP",
        html: `
            <h2>Project Partner Finder</h2>

            <p>Hello ${user.name},</p>

            <p>Your password reset OTP is:</p>

            <h1>${otp}</h1>

            <p>This OTP will expire in 10 minutes.</p>

            <p>If you did not request a password reset, please ignore this email.</p>
        `
    });
};

const resetPassword = async({ email, otp, newPassword }) => {
    // 1. Find user
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid reset request");
    }

    // 2. Check reset OTP
    if (!user.resetPasswordOTP) {
        throw new Error("Reset OTP not found");
    }

    // 3. Check OTP expiry
    if (!user.resetPasswordOTPExpire ||
        user.resetPasswordOTPExpire < new Date()
    ) {
        throw new Error("Reset OTP has expired");
    }

    // 4. Compare OTP
    if (user.resetPasswordOTP !== otp) {
        throw new Error("Invalid reset OTP");
    }

    // 5. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 6. Update password
    user.password = hashedPassword;

    // 7. Clear reset OTP
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpire = null;

    // 8. Invalidate existing refresh token
    user.refreshToken = null;

    // 9. Save changes
    await user.save();

    return {
        email: user.email
    };
};


const changePassword = async({
    userId,
    currentPassword,
    newPassword
}) => {
    // 1. Find user
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // 2. Check current password
    const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new Error("Current password is incorrect");
    }

    // 3. Prevent same password
    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        throw new Error(
            "New password must be different from current password"
        );
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(
        newPassword,
        12
    );

    // 5. Update password
    user.password = hashedPassword;

    // 6. Invalidate refresh token
    user.refreshToken = null;

    // 7. Save
    await user.save();

    return {
        email: user.email
    };
};


const registerE2EEPublicKey = async({
    userId,
    publicKey,
    keyVersion
}) => {
    // 1. Validate public key
    if (!publicKey || !publicKey.trim()) {
        throw new Error(
            "E2EE public key is required"
        );
    }

    // 2. Find user
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // 3. Save public key
    user.e2eePublicKey = publicKey.trim();

    // 4. Update key version if provided
    if (keyVersion !== undefined) {
        user.e2eeKeyVersion = keyVersion;
    }

    await user.save();

    return {
        e2eePublicKey: user.e2eePublicKey,
        e2eeKeyVersion: user.e2eeKeyVersion
    };
};

export {
    registerUser,
    verifyEmail,
    resendVerificationOTP,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword,
    changePassword,
    registerE2EEPublicKey

};