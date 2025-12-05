// Load secrets from .env file immediately
require('dotenv').config();

const { spawn } = require('child_process');
const path = require('path');

// 1. Get the endpoint (Loaded from .env now)
const endpoint = process.env.MCP_ENDPOINT;
if (!endpoint) {
  console.error("[Error] MCP_ENDPOINT is missing! Did you run 'node setup.js'?");
  process.exit(1);
}

// 2. Use the global mcp_exe tool
const mcpExe = 'mcp_exe';

console.log("[Bridge] Starting MCP Connector...");
console.log("[Bridge] Target:", endpoint);

// 3. Launch the bridge
// Note: 'env: process.env' is default, so mcp_exe inherits WOLFRAM_APP_ID automatically
const child = spawn(mcpExe, [
  '--ws', endpoint,
  '--mcp-config', path.join(__dirname, 'mcp.json')
], { stdio: 'inherit' });

child.on('error', (err) => {
  console.error("[Bridge Error] Failed to start mcp_exe:", err.message);
});

child.on('exit', (code) => process.exit(code));
