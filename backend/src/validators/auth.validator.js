import Joi from "joi";

const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required(),

    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    password: Joi.string()
        .min(8)
        .required()
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    password: Joi.string()
        .required()
});

const verifyEmailSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
});

const resetPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required(),

    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required(),

    newPassword: Joi.string()
        .min(8)
        .required()
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required(),

    newPassword: Joi.string()
        .min(8)
        .required()
});

export {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
};