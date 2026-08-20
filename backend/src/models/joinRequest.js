import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: [
            "pending",
            "accepted",
            "rejected"
        ],
        default: "pending"
    }
}, {
    timestamps: true
});

// Same user ek project ke liye
// duplicate request nahi bhej sakta
joinRequestSchema.index({
    project: 1,
    user: 1
}, {
    unique: true
});

const JoinRequest = mongoose.model(
    "JoinRequest",
    joinRequestSchema
);

export default JoinRequest;