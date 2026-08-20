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


const addSkill = async(userId, skill) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const normalizedSkill = skill.trim();

    const alreadyExists = user.skills.some(
        (existingSkill) =>
        existingSkill.toLowerCase() ===
        normalizedSkill.toLowerCase()
    );

    if (alreadyExists) {
        throw new Error("Skill already exists");
    }

    user.skills.push(normalizedSkill);

    await user.save();

    return {
        skills: user.skills
    };
};

const removeSkill = async(userId, skill) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const skillIndex = user.skills.findIndex(
        (existingSkill) =>
        existingSkill.toLowerCase() ===
        skill.trim().toLowerCase()
    );

    if (skillIndex === -1) {
        throw new Error("Skill not found");
    }

    user.skills.splice(skillIndex, 1);

    await user.save();

    return {
        skills: user.skills
    };
};

const getPublicProfile = async(userId) => {
    const user = await User.findById(userId).select(
        "name profileImage skills createdAt"
    );

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

const searchUsers = async({
    name,
    skill,
    page = 1,
    limit = 10
}) => {
    const query = {
        isActive: true,
        isEmailVerified: true
    };

    if (name) {
        query.name = {
            $regex: name,
            $options: "i"
        };
    }

    if (skill) {
        query.skills = {
            $regex: skill,
            $options: "i"
        };
    }

    // String query params ko number mein convert
    const currentPage = Number(page);
    const currentLimit = Number(limit);

    // Kitne users skip honge
    const skip = (currentPage - 1) * currentLimit;

    // Total matching users
    const totalUsers = await User.countDocuments(query);

    // Paginated users
    const users = await User.find(query)
        .select("name profileImage skills createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit);

    return {
        users,

        pagination: {
            totalUsers,
            totalPages: Math.ceil(
                totalUsers / currentLimit
            ),
            currentPage,
            limit: currentLimit
        }
    };
};
export {
    updateMyProfile,
    uploadProfileImage,
    addSkill,
    removeSkill,
    getPublicProfile,
    searchUsers
};