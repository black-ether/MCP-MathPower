const { spawn } = require('child_process');
const http = require('http');

// 1. Dummy HTTP Server (Keeps Cloud Run alive)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('MCP Client is Running!');
});
server.listen(8080, () => console.log('Dummy HTTP server listening on port 8080'));

// 2. The Real MCP Client
// It reads mcp.json, which tells it to run src/index.js
console.log('Starting MCP Client...');
const mcp = spawn('mcp_exe', ['--ws', process.env.MCP_ENDPOINT, '--mcp-config', '/app/mcp.json'], { stdio: 'inherit' });

mcp.on('close', (code) => {
  console.log(`MCP process exited with code ${code}`);
  process.exit(code);
});
