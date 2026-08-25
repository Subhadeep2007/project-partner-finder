import mongoose from "mongoose";


const joinRequestSchema =
    new mongoose.Schema({

        // ==========================================
        // PROJECT
        // ==========================================

        project: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "Project",

            required: true
        },


        // ==========================================
        // USER
        // ==========================================

        user: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true
        },


        // ==========================================
        // REQUEST STATUS
        // ==========================================

        status: {
            type: String,

            enum: [
                "pending",
                "accepted",
                "rejected",
                "removed",
                "left"
            ],

            default: "pending"
        },


        // ==========================================
        // RE-JOIN COUNT
        // ==========================================

        rejoinCount: {
            type: Number,

            default: 0,

            min: 0
        },


        // ==========================================
        // REMOVED BY OWNER
        // ==========================================

        removedAt: {
            type: Date,

            default: null
        },


        removedBy: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            default: null
        },


        // ==========================================
        // MEMBER LEFT BY THEMSELVES
        // ==========================================

        leftAt: {
            type: Date,

            default: null
        }

    }, {

        timestamps: true

    });


// ==========================================
// UNIQUE PROJECT + USER
// ==========================================
//
// Same project me same user ke multiple
// JoinRequest documents nahi banenge.
//
// Rejected / removed / left ke baad
// existing document reuse hoga.
//

joinRequestSchema.index({

    project: 1,

    user: 1

}, {

    unique: true

});


const JoinRequest =
    mongoose.models.JoinRequest ||
    mongoose.model(
        "JoinRequest",
        joinRequestSchema
    );


export default JoinRequest;