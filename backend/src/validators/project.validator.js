import Joi from "joi";


// ==========================================
// COMMON GITHUB URL VALIDATION
// ==========================================

const githubRepoPattern =
    /^https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+\/?$/;


// ==========================================
// CREATE PROJECT
// ==========================================

const createProjectSchema = Joi.object({

    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.empty": "Project title is required",

            "string.min": "Project title must be at least 3 characters",

            "string.max": "Project title cannot exceed 100 characters"
        }),


    description: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required()
        .messages({
            "string.empty": "Project description is required",

            "string.min": "Description must be at least 10 characters",

            "string.max": "Description cannot exceed 2000 characters"
        }),


    // ==============================
    // PROJECT STAGE
    // ==============================

    stage: Joi.string()
        .valid(
            "idea",
            "planning",
            "half-working",
            "mvp",
            "working",
            "completed"
        )
        .required()
        .messages({
            "any.only": "Invalid project stage",

            "any.required": "Project stage is required"
        }),


    // ==============================
    // GITHUB REPOSITORY
    // ==============================

    githubRepo: Joi.string()
        .trim()
        .pattern(githubRepoPattern)
        .required()
        .messages({

            "string.empty": "GitHub repository URL is required",

            "string.pattern.base": "Please provide a valid GitHub repository URL",

            "any.required": "GitHub repository URL is required"
        }),


    // ==============================
    // REQUIRED SKILLS
    // ==============================

    requiredSkills: Joi.array()
        .items(
            Joi.string()
            .trim()
            .min(2)
            .max(50)
        )
        .min(1)
        .required()
        .messages({

            "array.min": "At least one required skill is needed",

            "any.required": "Required skills are required"
        }),


    // ==============================
    // LOOKING FOR
    // ==============================

    lookingFor: Joi.array()
        .items(
            Joi.string()
            .valid(
                "frontend",
                "backend",
                "fullstack",
                "ai-ml",
                "data-science",
                "ui-ux",
                "devops",
                "mobile",
                "other"
            )
        )
        .min(1)
        .required()
        .messages({

            "array.min": "Select at least one partner role",

            "any.required": "Partner role is required"
        }),


    // ==============================
    // TEAM SIZE
    // ==============================

    teamSize: Joi.number()
        .integer()
        .min(2)
        .max(20)
        .required()
        .messages({

            "number.min": "Team size must be at least 2",

            "number.max": "Team size cannot exceed 20",

            "any.required": "Team size is required"
        }),


    // ==============================
    // COMMITMENT
    // ==============================

    commitment: Joi.string()
        .valid(
            "weekend",
            "part-time",
            "regular"
        )
        .required()
        .messages({

            "any.only": "Invalid commitment type",

            "any.required": "Commitment is required"
        }),


    // ==============================
    // COLLABORATION MODE
    // ==============================

    collaborationMode: Joi.string()
        .valid(
            "remote",
            "hybrid",
            "offline"
        )
        .required()
        .messages({

            "any.only": "Invalid collaboration mode",

            "any.required": "Collaboration mode is required"
        }),


    // ==============================
    // DEADLINE
    // ==============================

    deadline: Joi.date()
        .iso()
        .min("now")
        .allow(null)
        .optional()
        .messages({

            "date.format": "Deadline must be a valid date",

            "date.min": "Deadline cannot be in the past"
        })

});


// ==========================================
// UPDATE PROJECT
// ==========================================

const updateProjectSchema = Joi.object({

    title: Joi.string()
        .trim()
        .min(3)
        .max(100),


    description: Joi.string()
        .trim()
        .min(10)
        .max(2000),


    stage: Joi.string()
        .valid(
            "idea",
            "planning",
            "half-working",
            "mvp",
            "working",
            "completed"
        ),


    githubRepo: Joi.string()
        .trim()
        .pattern(githubRepoPattern),


    requiredSkills: Joi.array()
        .items(
            Joi.string()
            .trim()
            .min(2)
            .max(50)
        )
        .min(1),


    lookingFor: Joi.array()
        .items(
            Joi.string()
            .valid(
                "frontend",
                "backend",
                "fullstack",
                "ai-ml",
                "data-science",
                "ui-ux",
                "devops",
                "mobile",
                "other"
            )
        )
        .min(1),


    teamSize: Joi.number()
        .integer()
        .min(2)
        .max(20),


    commitment: Joi.string()
        .valid(
            "weekend",
            "part-time",
            "regular"
        ),


    collaborationMode: Joi.string()
        .valid(
            "remote",
            "hybrid",
            "offline"
        ),


    deadline: Joi.date()
        .iso()
        .min("now")
        .allow(null)

}).min(1);


export {
    createProjectSchema,
    updateProjectSchema
};