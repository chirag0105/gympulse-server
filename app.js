const express = require('express');
const fs = require('fs');
const path = require('path');

// THE ULTIMATE PROOF: Create a file in the root
try {
    fs.writeFileSync('NODE_IS_RUNNING.txt', 'Node started (app.js) at ' + new Date().toISOString());
} catch (e) { }

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('<h1>GymPulse Node Test (app.js)</h1><p>If you see this, Node is working!</p>');
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Minimal test (app.js) running' });
});

app.listen(PORT, () => {
    console.log('Server running on ' + PORT);
});
