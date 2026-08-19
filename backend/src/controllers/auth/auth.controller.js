import { registerUser } from "../../services/auth/auth.service.js";

const register = async(req, res, next) => {
    try {
        const user = await registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email.",
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export {
    register
};