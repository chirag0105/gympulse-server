require('dotenv').config();

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 5000,

    // Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
    DB_NAME: process.env.DB_NAME || 'gympulse',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'gympulse-dev-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // Super Admin
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || 'admin@gympulse.app',
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || 'Admin123!',
};

module.exports = env;
