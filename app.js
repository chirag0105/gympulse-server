const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// Changed path to src/config/env since app.js is now in root
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
        message: 'GymPulse API is alive',
        timestamp: new Date().toISOString(),
        node_version: process.version
    });
});

app.get('/', (req, res) => {
    res.send('<h1>GymPulse API Server</h1><p>Status: Working</p>');
});

// Routes - adjusted paths for app.js in root
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
    console.error('Route load error:', e.message);
}

app.use(notFound);
app.use(errorHandler);

const { sequelize } = require('./src/config/database');
const db = require('./src/models');

const start = async () => {
    try {
        await db.sequelize.sync({ alter: false });

        try {
            const createSuperAdmin = require('./src/seeders/create-super-admin');
            await createSuperAdmin();
        } catch (e) { }

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server listening on ${PORT}`);
        });
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
};

start();

module.exports = app;
