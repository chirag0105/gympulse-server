// Global error handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security and utility middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport — load only if available
try {
    const passport = require('./config/passport');
    app.use(passport.initialize());
} catch (err) {
    console.warn('Passport initialization skipped:', err.message);
}

// Health check (before any DB-dependent routes)
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: env.NODE_ENV,
            cors_origin: env.CORS_ORIGIN,
        },
    });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/pt-clients', require('./routes/ptClients'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/logs', require('./routes/workoutLogs'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications').router);

const { sequelize } = require('./config/database');
const db = require('./models');

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database Sync & Start
const startServer = async () => {
    try {
        console.log('Database sync in progress...');
        // This will create/update tables automatically on boot
        await db.sequelize.sync({ alter: false });
        console.log('Database synced successfully.');

        // Attempt to create super admin if it doesn't exist
        try {
            const createSuperAdmin = require('./seeders/create-super-admin');
            await createSuperAdmin();
        } catch (e) {
            console.log('Seeder skipped or failed:', e.message);
        }

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`GymPulse API running on port ${PORT} in ${env.NODE_ENV} mode`);
        });
    } catch (err) {
        console.error('SERVER FAILED TO START:', err);
    }
};

startServer();

module.exports = app;
