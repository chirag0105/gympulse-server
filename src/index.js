const express = require('express');
const fs = require('fs');
const path = require('path');

// THE ULTIMATE PROOF: Create a file in the root
try {
    fs.writeFileSync(path.join(__dirname, '..', 'NODE_IS_RUNNING.txt'), 'Node started at ' + new Date().toISOString());
} catch (e) {
    // If that fails, try current dir
    fs.writeFileSync('NODE_IS_RUNNING.txt', 'Node started at ' + new Date().toISOString());
}

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('<h1>GymPulse Node Test</h1><p>If you see this, Node is working!</p>');
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Minimal test running' });
});

app.listen(PORT, () => {
    console.log('Server running on ' + PORT);
});
