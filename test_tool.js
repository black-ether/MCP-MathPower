// test_tool.js - A utility to test MCP tools from the terminal
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// 1. Check input
const query = process.argv[2];
const toolName = process.argv[3] || 'wolfram'; // Default to wolfram

if (!query) {
  console.log("Usage: node test_tool.js \"Your Question Here\" [tool_name]");
  console.log("Example: node test_tool.js \"Factor 123456\" wolfram");
  console.log("Example: node test_tool.js \"1/7 + 1/9\" calc");
  process.exit(1);
}

// 2. Start the Tool (src/index.js) just like the Bridge does
// We pass the current environment (with keys) to the child
const serverProcess = spawn('node', ['src/index.js'], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'inherit'] // We pipe Stdin/Stdout, but let Stderr (logs) print to screen
});

// 3. Define the JSON-RPC Sequence
const initRequest = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "terminal-tester", version: "1.0" }
  }
};

const toolRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: toolName,
    arguments: toolName === 'wolfram' ? { query: query } : { expression: query }
  }
};

// 4. Handle Communication
let isInitialized = false;

serverProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    try {
      const json = JSON.parse(line);

      // Phase 1: Server replied to Init
      if (json.id === 0 && !isInitialized) {
        isInitialized = true;
        // Send "Initialized" notification
        serverProcess.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
        // Send the ACTUAL Query
        serverProcess.stdin.write(JSON.stringify(toolRequest) + "\n");
      }
      
      // Phase 2: Server replied with the Result
      else if (json.id === 1) {
        console.log("\n--- 🟢 TOOL RESULT ---");
        if (json.error) {
          console.log("❌ Error:", json.error.message);
        } else {
          // Parse the content cleanly
          const content = json.result.content[0].text;
          console.log(content);
        }
        console.log("----------------------\n");
        process.exit(0);
      }
    } catch (e) {
      // Ignore parsing errors for partial lines
    }
  }
});

// 5. Kick off the handshake
serverProcess.stdin.write(JSON.stringify(initRequest) + "\n");
