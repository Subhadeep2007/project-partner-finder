import Joi from "joi";

const updateProfileSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50),

    bio: Joi.string()
        .trim()
        .max(500),

    location: Joi.string()
        .trim()
        .max(100),

    college: Joi.string()
        .trim()
        .max(150),

    course: Joi.string()
        .trim()
        .max(100),

    graduationYear: Joi.number()
        .integer()
        .min(2000)
        .max(2100),

    experienceLevel: Joi.string()
        .valid("beginner", "intermediate", "advanced"),

    interests: Joi.array()
        .items(
            Joi.string()
            .trim()
            .max(50)
        )
        .max(20),

    github: Joi.string()
        .uri()
        .allow(""),

    linkedin: Joi.string()
        .uri()
        .allow(""),

    portfolio: Joi.string()
        .uri()
        .allow("")
}).min(1);


const addSkillSchema = Joi.object({
    skill: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
});

const searchUserSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional(),

    skill: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(10)
}).or("name", "skill");
export {
    updateProfileSchema,
    addSkillSchema,
    searchUserSchema
};