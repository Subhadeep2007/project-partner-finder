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

    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
    },
    isEdited: {
        type: Boolean,
        default: false
    },

    editedAt: {
        type: Date,
        default: null
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

    encryptedContent: {
        type: String,
        default: ""
    },

    iv: {
        type: String,
        default: ""
    },


    encryptedKeys: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        encryptedKey: {
            type: String,
            required: true
        },

        keyVersion: {
            type: Number,
            required: true
        }
    }],

    fileUrl: {
        type: String,
        default: ""
    },
    filePublicId: {
        type: String,
        default: ""
    },

    fileResourceType: {
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
    },

    encryptionData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    isDeletedForEveryone: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    },
}, {
    timestamps: true
});

const Message =
    mongoose.models.Message ||
    mongoose.model("Message", messageSchema);

export default Message;