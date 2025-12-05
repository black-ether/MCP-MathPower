// Load secrets (for VM)
require('dotenv').config();

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// 1. Validate Environment Variables
const endpoint = process.env.MCP_ENDPOINT;
if (!endpoint) {
  console.error("[Error] MCP_ENDPOINT is missing! Check your .env file.");
  process.exit(1);
}

// 2. Start Dummy HTTP Server (Universal Keep-Alive)
// This listens on port 8080 so Cloud Run (or other monitors) know we are alive.
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Xiaozhi MCP Bridge is Alive');
}).listen(PORT, () => console.log(`[Bridge] Health check listening on port ${PORT}`));

// 3. Generate mcp configuration dynamically
// This securely injects the Wolfram ID from .env into the tool configuration
const mcpConfig = {
  mcpServers: {
    tools: {
      command: "node",
      args: ["src/index.js"],
      env: {
        WOLFRAM_APP_ID: process.env.WOLFRAM_APP_ID 
      }
    }
  }
};

// Write the dynamic config to disk
const configPath = path.join(__dirname, 'mcp-generated.json');
fs.writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));
console.log("[Bridge] Generated dynamic config");

// 4. Launch the Connector (mcp_exe)
// We point it to the NEW generated config file
const mcpExe = 'mcp_exe';
console.log("[Bridge] Starting MCP Connector...");
console.log("[Bridge] Target:", endpoint);

const child = spawn(mcpExe, [
  '--ws', endpoint,
  '--mcp-config', configPath
], { stdio: 'inherit' });

child.on('error', (err) => console.error("[Bridge Error]", err.message));

child.on('exit', (code) => {
  console.log(`[Bridge] Exiting with code ${code}`);
  process.exit(code);
});
