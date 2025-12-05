const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { create, all } = require('mathjs');

// --- 1. SETUP TOOLS ---
const mathFraction = create(all, { number: 'Fraction' });
const mathDecimal = create(all, { number: 'number' });

const server = new McpServer({
  name: "xiaozhi-super-server",
  version: "1.0.0"
});

// Tool 1: Time (Renamed to "time")
server.tool("time", {}, async () => ({ 
  content: [{ type: "text", text: new Date().toISOString() }] 
}));

// Tool 2: Calculator (Renamed to "calc")
server.tool("calc", { expression: z.string() }, async ({ expression }) => {
  try {
    const result = mathFraction.evaluate(expression);
    return { content: [{ type: "text", text: mathFraction.format(result, { fraction: 'ratio' }) }] };
  } catch (err) {
    try {
      const result = mathDecimal.evaluate(expression);
      return { content: [{ type: "text", text: mathDecimal.format(result, { precision: 14 }) }] };
    } catch (e) { return { content: [{ type: "text", text: "Error: " + e.message }] }; }
  }
});

// Tool 3: Wolfram Alpha (Spoken Result)
const WOLFRAM_ID = process.env.WOLFRAM_APP_ID;
server.tool("wolfram_query", { query: z.string() }, async ({ query }) => {
  if (!WOLFRAM_ID) return { content: [{ type: "text", text: "Error: No Wolfram ID set." }] };

  // CHANGE 1: Use 'v1/spoken' instead of 'v1/llm-api'
  // CHANGE 2: Use parameter 'i' instead of 'input'
  const url = `https://api.wolframalpha.com/v1/spoken?appid=${WOLFRAM_ID}&i=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      // The Spoken API returns clear text errors like "No answer available", just pass them through
      return { content: [{ type: "text", text: `Wolfram: ${text}` }] };
    }

    return { content: [{ type: "text", text: text }] };
  } catch (err) {
    return { content: [{ type: "text", text: "Connection Error: " + err.message }] };
  }
});

// --- START MCP SERVER ---
const transport = new StdioServerTransport();
server.connect(transport);
