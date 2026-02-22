const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, 'BOOT_LOG.txt');

// 1. ABSOLUTE FIRST LINE LOGGING
fs.writeFileSync(logPath, `BOOT ${new Date().toISOString()} | NODE ${process.version}\n`);

const express = require('express');
const app = express();
const { sequelize } = require('./src/config/database');
const db = require('./src/models');

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'GymPulse API is alive on the new domain!' });
});

app.get('/', (req, res) => res.send('GymPulse Alive'));

const start = async () => {
    try {
        await db.sequelize.authenticate();
        fs.appendFileSync(logPath, 'DB Connected.\n');

        // Hostinger usually provides PORT via env
        const PORT = process.env.PORT || 3000;

        // Some Hostinger setups prefer binding to localhost (127.0.0.1) 
        // while others prefer 0.0.0.0. We will try 0.0.0.0 first.
        app.listen(PORT, '0.0.0.0', () => {
            fs.appendFileSync(logPath, `LISTENING ON ${PORT}\n`);
        });
    } catch (err) {
        fs.appendFileSync(logPath, `ERROR: ${err.message}\n`);
    }
};

start();
