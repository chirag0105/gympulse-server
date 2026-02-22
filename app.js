process.on('uncaughtException', (e) => {
    require('fs').writeFileSync('BOOT_LOG.txt', String(e.stack || e));
    process.exit(1);
});
process.on('unhandledRejection', (e) => {
    require('fs').writeFileSync('BOOT_LOG.txt', String(e && e.stack ? e.stack : e));
    process.exit(1);
});
require('fs').writeFileSync('BOOT_LOG.txt', `BOOT ${new Date().toISOString()}\nNODE ${process.version}\nCWD ${process.cwd()}\nPORT ${process.env.PORT}\n`);

const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('AGENT DIAGNOSTIC RUNNING\nTime: ' + new Date().toISOString() + '\nCheck BOOT_LOG.txt');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    fs.appendFileSync('BOOT_LOG.txt', `Listening on ${PORT}\n`);
});
