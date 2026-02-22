const fs = require('fs');
const path = require('path');

// Simple logger to a file we can read via Hostinger File Manager
const logToFile = (msg) => {
    const logPath = path.join(__root, 'startup.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
};

global.__root = path.join(__dirname, '..');

logToFile('Server starting...');

// Global error handlers
process.on('uncaughtException', (err) => {
    logToFile('UNCAUGHT EXCEPTION: ' + err.message + '\n' + err.stack);
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    logToFile('UNHANDLED REJECTION: ' + reason);
    console.error('UNHANDLED REJECTION:', reason);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

logToFile('Loaded dependencies.');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

logToFile('CORS Origin: ' + env.CORS_ORIGIN);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: env.NODE_ENV
        },
    });
});

// Dummy route for test
app.get('/', (req, res) => {
    res.send('GymPulse API is Running');
});

// Protected routes (wrap in try-catch to log load errors)
try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/exercises', require('./routes/exercises'));
    app.use('/api/workouts', require('./routes/workouts'));
    app.use('/api/pt-clients', require('./routes/ptClients'));
    app.use('/api/schedules', require('./routes/schedules'));
    app.use('/api/logs', require('./routes/workoutLogs'));
    app.use('/api/measurements', require('./routes/measurements'));
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/notifications', require('./routes/notifications').router);
    logToFile('Routes loaded.');
} catch (err) {
    logToFile('Error loading routes: ' + err.message);
}

app.use(notFound);
app.use(errorHandler);

const { sequelize } = require('./config/database');
const db = require('./models');

const startServer = async () => {
    try {
        logToFile('Attempting DB sync...');
        await db.sequelize.sync({ alter: false });
        logToFile('DB synced.');

        try {
            const createSuperAdmin = require('./seeders/create-super-admin');
            await createSuperAdmin();
            logToFile('Seeder ran.');
        } catch (e) {
            logToFile('Seeder check skipped: ' + e.message);
        }

        // IMPORTANT FIX: Hostinger might pass a non-integer port (like a socket)
        let PORT = process.env.PORT;
        if (!PORT || isNaN(parseInt(PORT, 10))) {
            // If PORT is not a number, it might be a socket path. Use it as is.
            // If it's missing entirely, use 3000.
            PORT = PORT || 3000;
        } else {
            PORT = parseInt(PORT, 10);
        }

        app.listen(PORT, () => {
            logToFile(`Server successfully listening on: ${PORT}`);
            console.log(`GymPulse API running on ${PORT}`);
        });
    } catch (err) {
        logToFile('CRITICAL BOOT ERROR: ' + err.message + '\n' + err.stack);
        console.error('BOOT ERROR:', err);
    }
};

startServer();

module.exports = app;
