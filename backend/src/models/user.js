import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    profileImage: {
        type: String,
        default: ""
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationOTP: {
        type: String,
        default: null
    },

    emailVerificationOTPExpire: {
        type: Date,
        default: null
    },

    resetPasswordOTP: {
        type: String,
        default: null
    },

    resetPasswordOTPExpire: {
        type: Date,
        default: null
    },

    refreshToken: {
        type: String,
        default: null
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
const User =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

export default User;