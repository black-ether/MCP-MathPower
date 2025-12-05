const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { create, all } = require('mathjs');
const sharp = require('sharp');

// --- CONFIGURATION ---
// These are now passed correctly from bridge.js
const WOLFRAM_ID = process.env.WOLFRAM_APP_ID;
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX_ID;

// --- MATH SETUP ---
const mathFraction = create(all, { number: 'Fraction' });
const mathDecimal = create(all, { number: 'number' });

const server = new McpServer({
  name: "xiaozhi-super-server",
  version: "2.0.0"
});

// --- TOOL 1: CALCULATOR ---
server.tool("calculate", { expression: z.string() }, async ({ expression }) => {
  try {
    const result = mathFraction.evaluate(expression);
    return { content: [{ type: "text", text: mathFraction.format(result, { fraction: 'ratio' }) }] };
  } catch (err) {
    try {
      const result = mathDecimal.evaluate(expression);
      return { content: [{ type: "text", text: mathDecimal.format(result, { precision: 14 }) }] };
    } catch (e) { return { content: [{ type: "text", text: "Math Error: " + e.message }] }; }
  }
});

// --- TOOL 2: WOLFRAM ---
server.tool("wolfram_query", { query: z.string() }, async ({ query }) => {
  if (!WOLFRAM_ID) return { content: [{ type: "text", text: "Error: No Wolfram ID." }] };
  try {
    const url = `https://api.wolframalpha.com/v1/spoken?appid=${WOLFRAM_ID}&i=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const text = await response.text();
    return { content: [{ type: "text", text: text }] };
  } catch (err) { return { content: [{ type: "text", text: "Wolfram Error: " + err.message }] }; }
});

// --- TOOL 3: IMAGE SEARCH ---
server.tool("get_image", { query: z.string() }, async ({ query }) => {
    if (!GOOGLE_KEY || !GOOGLE_CX) {
      return { content: [{ type: "text", text: "Error: Google Search Keys missing." }] };
    }
    try {
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&searchType=image&num=1`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (!searchData.items || searchData.items.length === 0) return { content: [{ type: "text", text: "No images found." }] };

      const imageUrl = searchData.items[0].link;
      const imgRes = await fetch(imageUrl);
      const imgBuffer = await imgRes.arrayBuffer();

      const resizedBuffer = await sharp(Buffer.from(imgBuffer))
        .resize({ width: 320, height: 240, fit: 'inside' }) 
        .toFormat('jpeg', { quality: 80 })
        .toBuffer();

      return {
        content: [{ 
            type: "image", 
            data: resizedBuffer.toString('base64'), 
            mimeType: "image/jpeg" 
        }]
      };
    } catch (err) {
      return { content: [{ type: "text", text: "Image Error: " + err.message }] };
    }
  }
);

// --- CRITICAL FIX: START STDIO TRANSPORT ---
// We removed the HTTP server and replaced it with this:
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Xiaozhi MCP Server running on Stdio...");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
