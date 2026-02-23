require('dotenv').config();

// Debug helper to log which env vars are present (not values)
const debugEnv = () => {
    const vars = [
        'DB_HOST', 'DB_USER', 'DB_NAME', 'DB_PASSWORD',
        'JWT_SECRET', 'CORS_ORIGIN', 'PORT', 'DATABASE_URL'
    ];
    const status = vars.map(v => `${v}: ${process.env[v] ? 'PRESENT' : 'MISSING'}`);
    return status.join(' | ');
};

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 3000,

    // Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
    DB_NAME: process.env.DB_NAME || 'gympulse',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DATABASE_URL: process.env.DATABASE_URL || null,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'gympulse-dev-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',

    // Super Admin Seed
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,

    debugStatus: debugEnv()
};

module.exports = env;
