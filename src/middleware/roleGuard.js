const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Authentication required.' },
            });
        }

        // Super admin can access everything
        if (req.user.role === 'super_admin') {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { message: 'You do not have permission to access this resource.' },
            });
        }

        next();
    };
};

module.exports = roleGuard;
