import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import generateOTP from "../../utils/generateOTP.js";
import sendEmail from "../../utils/sendEmail.js";

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

export {
    registerUser
};