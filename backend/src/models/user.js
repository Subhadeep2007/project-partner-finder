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
    },

    lastSeen: {
        type: Date,
        default: null
    },

    bio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
    },

    location: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
    },

    college: {
        type: String,
        trim: true,
        maxlength: 150,
        default: ""
    },

    course: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
    },

    graduationYear: {
        type: Number,
        min: 2000,
        max: 2100,
        default: null
    },

    skills: {
        type: [String],
        default: []
    },

    experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },

    interests: {
        type: [String],
        default: []
    },

    github: {
        type: String,
        trim: true,
        default: ""
    },

    linkedin: {
        type: String,
        trim: true,
        default: ""
    },

    portfolio: {
        type: String,
        trim: true,
        default: ""
    },


    e2eePublicKey: {
        type: String,
        default: ""
    },

    e2eeKeyVersion: {
        type: Number,
        default: 1
    },
}, {
    timestamps: true
});
const User =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

export default User;