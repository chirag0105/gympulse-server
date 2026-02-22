const bcrypt = require('bcryptjs');
const { User, PtClient } = require('../models');
const { generateToken } = require('../utils/jwt');

const SALT_ROUNDS = 12;

const register = async ({ email, password, firstName, lastName, role }) => {
    // Validate role
    if (!['pt', 'client'].includes(role)) {
        const error = new Error('Role must be "pt" or "client". Super admin cannot self-register.');
        error.statusCode = 400;
        throw error;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
        const error = new Error('An account with this email already exists');
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role,
    });

    // If registering as client, check for pending PT invites
    if (role === 'client') {
        const pendingInvites = await PtClient.findAll({
            where: {
                clientEmail: email.toLowerCase(),
                status: 'invited',
            },
        });

        for (const invite of pendingInvites) {
            await invite.update({
                clientId: user.id,
                status: 'active',
                joinedAt: new Date(),
            });
        }
    }

    // Generate token
    const token = generateToken(user);

    // Return user without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    return { user: userResponse, token };
};

const login = async ({ email, password }) => {
    // Find user
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Check if account is active
    if (!user.isActive) {
        const error = new Error('Account has been deactivated');
        error.statusCode = 403;
        throw error;
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate token
    const token = generateToken(user);

    // Return user without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    return { user: userResponse, token };
};

const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
    });

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return user;
};

module.exports = { register, login, getProfile };
