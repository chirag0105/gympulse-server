const { Sequelize } = require('sequelize');
const env = require('./env');

console.log('[DB] Attempting to connect...');
console.log('[DB] Host:', env.DB_HOST);
console.log('[DB] Database:', env.DB_NAME);
console.log('[DB] User:', env.DB_USER);
console.log('[DB] Port:', env.DB_PORT);

let sequelize;

// Support DATABASE_URL connection string if provided
if (process.env.DATABASE_URL) {
    console.log('[DB] Using DATABASE_URL connection string');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: env.NODE_ENV === 'development' ? console.log : false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        define: { timestamps: true, underscored: true },
    });
} else {
    console.log('[DB] Using individual DB_* env vars');
    sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: 'mysql',
        logging: env.NODE_ENV === 'development' ? console.log : false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        define: { timestamps: true, underscored: true },
    });
}

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
        return false;
    }
};

// Test connection immediately on startup
testConnection();

module.exports = { sequelize, testConnection };
