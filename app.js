const http = require('http');
const fs = require('fs');
const path = require('path');

// FORCE LOGGING
const logFile = path.join(__dirname, 'BOOT_LOG.txt');
fs.writeFileSync(logFile, 'NODE IS EXECUTING AT ' + new Date().toISOString() + '\n');

const server = http.createServer((req, res) => {
    fs.appendFileSync(logFile, 'Request received: ' + req.url + '\n');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GYMPULSE NODE IS WORKING WITHOUT EXPRESS\nTime: ' + new Date().toISOString());
});

const PORT = process.env.PORT || 3000;
// Use 0.0.0.0 to ensure it binds to external requests
server.listen(PORT, '0.0.0.0', () => {
    fs.appendFileSync(logFile, 'Listening on ' + PORT + ' at 0.0.0.0\n');
    console.log('Server running on ' + PORT);
});
