const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");

// Create a server
const server = new McpServer({
  name: "time-server",
  version: "1.0.0"
});

// Add a tool to get the current time
server.tool("get_time", {}, async () => {
  return {
    content: [{
      type: "text",
      text: "The current time is: " + new Date().toISOString()
    }]
  };
});

// Connect using Standard Input/Output (the default for MCP)
const transport = new StdioServerTransport();
server.connect(transport);
