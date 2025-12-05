// Load secrets
require('dotenv').config();

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// 1. Validate Environment
const endpoint = process.env.MCP_ENDPOINT;
if (!endpoint) {
  console.error("[Error] MCP_ENDPOINT is missing! Check .env");
  process.exit(1);
}

// 2. Start Keep-Alive Server (Only ONE allowed on port 8080)
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Xiaozhi MCP Bridge is Alive');
}).listen(PORT, () => console.log(`[Bridge] Health check listening on port ${PORT}`));

// 3. Generate Dynamic Config
// We MUST pass all keys (Wolfram + Google) to the child process here
const mcpConfig = {
  mcpServers: {
    tools: {
      command: "node",
      args: ["src/index.js"],
      env: {
        WOLFRAM_APP_ID: process.env.WOLFRAM_APP_ID,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY, // Added this
        GOOGLE_CX_ID: process.env.GOOGLE_CX_ID      // Added this
      }
    }
  }
};

const configPath = path.join(__dirname, 'mcp-generated.json');
fs.writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));
console.log("[Bridge] Config generated with all keys.");

// 4. Launch Connector
// Assuming mcp_exe is in the current folder (./mcp_exe)
const mcpExe = 'mcp_exe'; 
console.log(`[Bridge] Spawning ${mcpExe}...`);

const child = spawn(mcpExe, [
  '--ws', endpoint,
  '--mcp-config', configPath
], { stdio: 'inherit' });

child.on('error', (err) => console.error("[Bridge Error]", err.message));

// Handle Exit
child.on('exit', (code) => {
  console.log(`[Bridge] Child exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C properly
process.on('SIGINT', () => {
  console.log("\n[Bridge] Stopping...");
  child.kill('SIGKILL');
  process.exit(0);
});
