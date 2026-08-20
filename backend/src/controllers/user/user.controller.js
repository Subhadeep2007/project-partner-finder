import User from "../../models/user.js";
import {
    updateMyProfile,
    uploadProfileImage,
    addSkill,
    removeSkill,
    getPublicProfile,
    searchUsers
} from "../../services/user/user.service.js";
const getMyProfile = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select(
            "-password -refreshToken -emailVerificationOTP -emailVerificationOTPExpire -resetPasswordOTP -resetPasswordOTPExpire"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};
const updateProfile = async(req, res, next) => {
    try {
        const user = await updateMyProfile(
            req.user.userId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};


const uploadProfileImageController = async(req, res, next) => {
    try {
        const result = await uploadProfileImage(
            req.user.userId,
            req.file
        );

        return res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const addSkillController = async(req, res, next) => {
    try {
        const result = await addSkill(
            req.user.userId,
            req.body.skill
        );

        return res.status(200).json({
            success: true,
            message: "Skill added successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const removeSkillController = async(req, res, next) => {
    try {
        const result = await removeSkill(
            req.user.userId,
            req.params.skill
        );

        return res.status(200).json({
            success: true,
            message: "Skill removed successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getPublicProfileController = async(req, res, next) => {
    try {
        const result = await getPublicProfile(req.params.userId);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const searchUsersController = async(req, res, next) => {
    try {
        const result = await searchUsers(req.query);

        return res.status(200).json({
            success: true,
            pagination: result.pagination,
            data: result.users
        });
    } catch (error) {
        next(error);
    }
};
export {
    getMyProfile,
    updateProfile,
    uploadProfileImageController,
    addSkillController,
    removeSkillController,
    getPublicProfileController,
    searchUsersController
};