const authService = require('../services/authService');

const registerUser = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        const result = await authService.register({ email, password, firstName, lastName, role });

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);

        res.json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, getMe };
