const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, 'BOOT_LOG.txt');

// Try to write to current dir and parent dir just in case
try {
    fs.writeFileSync('BOOT_LOG.txt', `STARTING FROM ${__filename} at ${new Date().toISOString()}\n`);
} catch (e) { }

const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('MULTIPATH BOOT SUCCESSFUL');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    try { fs.appendFileSync('BOOT_LOG.txt', `SUCCESS: LISTENING ON ${PORT}\n`); } catch (e) { }
});
