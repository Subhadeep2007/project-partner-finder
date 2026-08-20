import Joi from "joi";

const createProjectSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .required(),

    description: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required(),

    requiredSkills: Joi.array()
        .items(
            Joi.string()
            .trim()
            .min(2)
            .max(50)
        )
        .min(1)
        .required(),

    teamSize: Joi.number()
        .integer()
        .min(2)
        .max(20)
        .required()
});


const updateProjectSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(100),

    description: Joi.string()
        .trim()
        .min(10)
        .max(2000),

    requiredSkills: Joi.array()
        .items(
            Joi.string()
            .trim()
            .min(1)
        ),

    teamSize: Joi.number()
        .integer()
        .min(1)
        .max(50)
}).min(1);

export {
    createProjectSchema,
    updateProjectSchema
};