import User from "../../models/user.js";

import cloudinary from "../../config/cloudinary.js";
const updateMyProfile = async(userId, profileData) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const allowedFields = [
        "name",
        "bio",
        "location",
        "college",
        "course",
        "graduationYear",
        "experienceLevel",
        "interests",
        "github",
        "linkedin",
        "portfolio"
    ];

    allowedFields.forEach((field) => {
        if (profileData[field] !== undefined) {
            user[field] = profileData[field];
        }
    });

    await user.save();

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        location: user.location,
        college: user.college,
        course: user.course,
        graduationYear: user.graduationYear,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        interests: user.interests,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio
    };
};
const uploadProfileImage = async(userId, file) => {
    if (!file) {
        throw new Error("Profile image is required");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
                folder: "project-partner-finder/profile-images",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(file.buffer);
    });

    user.profileImage = result.secure_url;

    await user.save();

    return {
        profileImage: user.profileImage
    };
};
export {
    updateMyProfile,
    uploadProfileImage
};