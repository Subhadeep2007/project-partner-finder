import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    deliveredTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],


    messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
    },

    content: {
        type: String,
        default: ""
    },

    fileUrl: {
        type: String,
        default: ""
    },

    fileName: {
        type: String,
        default: ""
    },

    fileSize: {
        type: Number,
        default: null
    },

    mimeType: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const Message =
    mongoose.models.Message ||
    mongoose.model("Message", messageSchema);

export default Message;