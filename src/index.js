// EXTREMELY MINIMAL STARTUP
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Read env directly from process.env (Hostinger injected)
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const NODE_ENV = process.env.NODE_ENV || 'production';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Natively expose health check
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

// Import shared routes logic
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
} catch (e) {
    console.error('Route load error:', e.message);
}

// Database Connection
const { sequelize } = require('./config/database');
const db = require('./models');

const start = async () => {
    try {
        console.log('Connecting to DB...');
        await db.sequelize.sync({ alter: false });
        console.log('DB synced.');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server listening on ${PORT}`);
        });
    } catch (err) {
        console.error('Fatal start error:', err.message);
    }
};

start();

module.exports = app;
