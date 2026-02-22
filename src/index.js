const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const passport = require('./config/passport');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// API routes
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: env.NODE_ENV,
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

// Serve React static files in production
if (env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, '..', 'public');
    app.use(express.static(publicPath));

    // Catch-all: serve React app for non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   🏋️  GymPulse API Server            ║
  ║   Port: ${PORT}                         ║
  ║   Mode: ${env.NODE_ENV.padEnd(25)}║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
