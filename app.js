// DEPLOY TEST - IF YOU SEE THIS IN SSH LL, DEPLOY WORKED (APP.JS)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Minimal test running from app.js' });
});

app.listen(PORT, () => {
    console.log('Server running');
});
