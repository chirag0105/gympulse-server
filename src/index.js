// Minimal startup to diagnose Hostinger issues
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ status: 'alive', port: PORT, node: process.version, env_keys: Object.keys(process.env).filter(k => k.startsWith('DB') || k.startsWith('PORT') || k.startsWith('NODE') || k.startsWith('CORS')) });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
