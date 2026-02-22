// 1. DIAGNOSTIC SHIELD (Support Agent's Logic)
const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, 'BOOT_LOG.txt');

fs.writeFileSync(logPath, `BOOT ${new Date().toISOString()} | NODE ${process.version} | CWD ${process.cwd()}\n`);
fs.appendFileSync(logPath, `ENV_PORT: ${process.env.PORT}\n`);

process.on('uncaughtException', (e) => {
    fs.appendFileSync(logPath, `\nUNCAUGHT EXCEPTION: ${e.stack || e}\n`);
    process.exit(1);
});

process.on('unhandledRejection', (e) => {
    fs.appendFileSync(logPath, `\nUNHANDLED REJECTION: ${e.stack || e}\n`);
    process.exit(1);
});

// 2. REAL APPLICATION START
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// Adjusted paths for app.js in root
const env = require('./src/config/env');
const errorHandler = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'GymPulse API is alive on Hostinger!',
        timestamp: new Date().toISOString(),
        db_status: 'Checking...'
    });
});

app.get('/', (req, res) => {
    res.send('<h1>GymPulse API Server</h1><p>Status: Running</p>');
});

// Routes
try {
    app.use('/api/auth', require('./src/routes/auth'));
    app.use('/api/exercises', require('./src/routes/exercises'));
    app.use('/api/workouts', require('./src/routes/workouts'));
    app.use('/api/pt-clients', require('./src/routes/ptClients'));
    app.use('/api/schedules', require('./src/routes/schedules'));
    app.use('/api/logs', require('./src/routes/workoutLogs'));
    app.use('/api/measurements', require('./src/routes/measurements'));
    app.use('/api/admin', require('./src/routes/admin'));
    app.use('/api/notifications', require('./src/routes/notifications').router);
} catch (e) {
    fs.appendFileSync(logPath, `RELOAD ERROR: ${e.message}\n`);
}

app.use(notFound);
app.use(errorHandler);

const { sequelize } = require('./src/config/database');
const db = require('./src/models');

const start = async () => {
    try {
        fs.appendFileSync(logPath, 'Connecting to Database...\n');
        await db.sequelize.authenticate();
        fs.appendFileSync(logPath, 'Sequelize Authenticated.\n');

        await db.sequelize.sync({ alter: false });
        fs.appendFileSync(logPath, 'DB Synced.\n');

        // IMPORTANT: Hostinger requires binding to process.env.PORT
        // If it's undefined, we fallback to 3000 but log it clearly
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, '0.0.0.0', () => {
            fs.appendFileSync(logPath, `LISTENING ON PORT ${PORT}\n`);
            console.log(`Server listening on ${PORT}`);
        });
    } catch (err) {
        fs.appendFileSync(logPath, `FATAL DB ERROR: ${err.message}\n`);
        // We DON'T exit here so we can still see the health check even if DB fails
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            fs.appendFileSync(logPath, `LISTENING (LIMITED) ON PORT ${PORT}\n`);
        });
    }
};

start();

module.exports = app;
