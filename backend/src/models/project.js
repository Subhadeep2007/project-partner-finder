import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 2000
    },

    // ==============================
    // PROJECT STAGE
    // ==============================

    stage: {
        type: String,
        enum: [
            "idea",
            "planning",
            "half-working",
            "mvp",
            "working",
            "completed"
        ],
        required: true,
        default: "idea"
    },


    // ==============================
    // GITHUB REPOSITORY
    // ==============================

    githubRepo: {
        type: String,
        required: true,
        trim: true,
        match: [
            /^https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+\/?$/,
            "Please provide a valid GitHub repository URL"
        ]
    },


    // ==============================
    // REQUIRED SKILLS
    // ==============================

    requiredSkills: {
        type: [String],
        required: true,

        validate: {
            validator: function(skills) {

                return (
                    Array.isArray(skills) &&
                    skills.length > 0
                );

            },

            message: "At least one required skill is needed"
        }
    },


    // ==============================
    // WHAT TYPE OF PARTNER IS NEEDED
    // ==============================

    lookingFor: {
        type: [String],

        enum: [
            "frontend",
            "backend",
            "fullstack",
            "ai-ml",
            "data-science",
            "ui-ux",
            "devops",
            "mobile",
            "other"
        ],

        default: []
    },


    // ==============================
    // TEAM SIZE
    // ==============================

    teamSize: {
        type: Number,
        required: true,
        min: 2,
        max: 20
    },


    // ==============================
    // EXPECTED COMMITMENT
    // ==============================

    commitment: {
        type: String,

        enum: [
            "weekend",
            "part-time",
            "regular"
        ],

        default: "part-time"
    },


    // ==============================
    // COLLABORATION MODE
    // ==============================

    collaborationMode: {
        type: String,

        enum: [
            "remote",
            "hybrid",
            "offline"
        ],

        default: "remote"
    },


    // ==============================
    // OPTIONAL DEADLINE
    // ==============================

    deadline: {
        type: Date,
        default: null
    },


    // ==============================
    // OWNER
    // ==============================

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    // ==============================
    // PROJECT MEMBERS
    // ==============================

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],


    // ==============================
    // CURRENT MEMBER COUNT
    // ==============================

    currentMembers: {
        type: Number,
        default: 1
    },


    // ==============================
    // PROJECT STATUS
    // ==============================

    status: {
        type: String,
        enum: [
            "open",
            "closed",
            "completed"
        ],
        default: "open"
    }

}, {
    timestamps: true
});


const Project =
    mongoose.models.Project ||
    mongoose.model(
        "Project",
        projectSchema
    );


export default Project;