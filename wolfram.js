const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

// DEBUG LOG: Server starting
console.error("--- [DEBUG] Wolfram Script Starting ---");

const server = new McpServer({
  name: "wolfram",
  version: "2.1.0"
});

// DEBUG LOG: Check if ID exists (We hide the last part for safety)
const APP_ID = process.env.WOLFRAM_APP_ID;
if (APP_ID) {
  console.error(`--- [DEBUG] App ID found: ${APP_ID.substring(0, 4)}... ---`);
} else {
  console.error("--- [DEBUG] CRITICAL ERROR: App ID is MISSING in process.env ---");
}

server.tool(
  "wolfram_query",
  {
    query: z.string()
  },
  async ({ query }) => {
    console.error(`--- [DEBUG] Tool called with query: "${query}" ---`);

    if (!APP_ID) {
      console.error("--- [DEBUG] Failed: No App ID ---");
      return { content: [{ type: "text", text: "Error: WOLFRAM_APP_ID is missing." }] };
    }

    try {
      const url = `https://www.wolframalpha.com/api/v1/llm-api?appid=${APP_ID}&input=${encodeURIComponent(query)}`;
      console.error(`--- [DEBUG] Fetching URL: ${url} ---`);
      
      // Set a 15-second timeout so we don't hang forever
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      console.error(`--- [DEBUG] Response Status: ${response.status} ---`);
      
      const text = await response.text();
      console.error(`--- [DEBUG] Response Length: ${text.length} chars ---`);

      if (!response.ok) {
        console.error(`--- [DEBUG] Wolfram Error Body: ${text} ---`);
        return { content: [{ type: "text", text: `Wolfram Error: ${text}` }] };
      }

      return {
        content: [{
          type: "text",
          text: text
        }]
      };
    } catch (err) {
      console.error(`--- [DEBUG] CRASH: ${err.message} ---`);
      return { content: [{ type: "text", text: "Connection Error: " + err.message }] };
    }
  }
);

const transport = new StdioServerTransport();
server.connect(transport);
console.error("--- [DEBUG] Wolfram Server Connected to Stdio ---");
