const { spawn } = require('child_process');
const http = require('http');

// 1. Start a dummy HTTP server to satisfy Cloud Run's health check
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('MCP Client is Running!');
});
server.listen(8080, () => {
  console.log('Dummy HTTP server listening on port 8080');
});

// 2. Start the real MCP tool using the environment variable
console.log('Starting MCP Client...');
const mcp = spawn('mcp_exe', ['--ws', process.env.MCP_ENDPOINT, '--mcp-config', '/app/mcp.json'], { stdio: 'inherit' });

// If the MCP tool crashes, shut down everything so Cloud Run restarts it
mcp.on('close', (code) => {
  console.log(`MCP process exited with code ${code}`);
  process.exit(code);
});
