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

    requiredSkills: {
        type: [String],
        required: true,
        validate: {
            validator: function(skills) {
                return skills.length > 0;
            },
            message: "At least one required skill is needed"
        }
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    teamSize: {
        type: Number,
        required: true,
        min: 2,
        max: 20
    },

    currentMembers: {
        type: Number,
        default: 1
    },

    status: {
        type: String,
        enum: ["open", "closed", "completed"],
        default: "open"
    }
}, {
    timestamps: true
});

const Project = mongoose.model(
    "Project",
    projectSchema
);

export default Project;