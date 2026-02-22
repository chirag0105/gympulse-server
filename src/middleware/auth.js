const { User } = require('../models');
const { verifyToken } = require('../utils/jwt');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: { message: 'Access denied. No token provided.' },
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: { message: 'Invalid token or account deactivated.' },
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: { message: 'Invalid or expired token.' },
        });
    }
};

module.exports = auth;
