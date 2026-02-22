const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { registerUser, loginUser, getMe } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register
router.post(
    '/register',
    validate([
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('firstName')
            .trim()
            .notEmpty()
            .withMessage('First name is required'),
        body('lastName')
            .trim()
            .notEmpty()
            .withMessage('Last name is required'),
        body('role')
            .isIn(['pt', 'client'])
            .withMessage('Role must be "pt" or "client"'),
    ]),
    registerUser
);

// POST /api/auth/login
router.post(
    '/login',
    validate([
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ]),
    loginUser
);

// GET /api/auth/me (protected)
router.get('/me', auth, getMe);

// Google SSO Routes
const passport = require('passport');
const { generateToken } = require('../utils/jwt');

// Trigger Google OAuth flow
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=true' }),
    (req, res) => {
        // Successful authentication, generate token
        const token = generateToken(req.user);

        // Redirect back to frontend with token in URL 
        // In a real app, perhaps use a better method like httpOnly cookie for token delivery,
        // but passing it back via frontend route handler is solid for our scope
        res.redirect(`${process.env.CORS_ORIGIN}/auth/success?token=${token}`);
    }
);

module.exports = router;
