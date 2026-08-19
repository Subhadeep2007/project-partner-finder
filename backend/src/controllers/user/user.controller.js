import User from "../../models/user.js";

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

export {
    getMyProfile
};