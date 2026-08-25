import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    type: {
        type: String,
        enum: [
            "join_request",
            "join_accepted",
            "join_rejected",
            "new_message",
            "member_joined",
            "member_left",
            "member_removed"
        ],
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },

    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null
    },

    isRead: {
        type: Boolean,
        default: false,
        index: true
    },


    // SOFT DELETE
    // ==========================================

    deletedAt: {
        type: Date,
        default: null,
        index: true
    }

}, {
    timestamps: true
});

const Notification =
    mongoose.models.Notification ||
    mongoose.model(
        "Notification",
        notificationSchema
    );

export default Notification;