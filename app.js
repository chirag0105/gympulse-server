const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./src/config/env');
const errorHandler = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'GymPulse API is alive on Render!',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send('<h1>GymPulse API Server</h1><p>Status: Online</p>');
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/exercises', require('./src/routes/exercises'));
app.use('/api/workouts', require('./src/routes/workouts'));
app.use('/api/pt-clients', require('./src/routes/ptClients'));
app.use('/api/schedules', require('./src/routes/schedules'));
app.use('/api/logs', require('./src/routes/workoutLogs'));
app.use('/api/measurements', require('./src/routes/measurements'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/notifications', require('./src/routes/notifications').router);

app.use(notFound);
app.use(errorHandler);

const db = require('./src/models');

const start = async () => {
    try {
        console.log('Connecting to database...');
        await db.sequelize.authenticate();
        console.log('Database connection stable.');

        // Sync models (don't force in production)
        await db.sequelize.sync({ alter: false });

        // Seed super admin if it doesn't exist
        try {
            const createSuperAdmin = require('./src/seeders/create-super-admin');
            await createSuperAdmin();
        } catch (e) {
            console.log('Super admin check completed.');
        }

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        // On Render, if we fail to connect to DB, let the process crash 
        // so Render knows to retry
        process.exit(1);
    }
};

start();

module.exports = app;
