// src/index.js - Main MCP Server (Consolidated)
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const http = require('http');

// Import all tools
const timeTool = require('./tools/time.js');
const calculatorTool = require('./tools/calculator.js');
const wolframTool = require('./tools/wolfram.js');

// Create the MCP server
const server = new McpServer({
  name: "xiaozhi-super-server",
  version: "1.0.0"
});

// Register Tool 1: Time
server.tool(timeTool.name, timeTool.inputSchema, timeTool.handler);

// Register Tool 2: Calculator
server.tool(calculatorTool.name, calculatorTool.inputSchema, calculatorTool.handler);

// Register Tool 3: Wolfram
server.tool(wolframTool.name, wolframTool.inputSchema, wolframTool.handler);

console.error("[INFO] MCP Server initialized with 3 tools: get_time, calculate, wolfram_query");

// --- HEALTH CHECK SERVER (for Cloud Run) ---
const healthCheckServer = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('MCP Server is running');
});

const PORT = process.env.PORT || 8080;
healthCheckServer.listen(PORT, () => {
  console.error(`[INFO] Health check server listening on port ${PORT}`);
});

// --- CONNECT TO STDIO (MCP Protocol) ---
const transport = new StdioServerTransport();
server.connect(transport);

console.error("[INFO] MCP Server connected to stdio transport");

// Graceful shutdown
process.on('SIGINT', () => {
  console.error("[INFO] Shutting down MCP Server");
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error("[INFO] Terminating MCP Server");
  process.exit(0);
});
