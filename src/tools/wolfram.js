// Wolfram Alpha Tool - Query Wolfram Alpha API
const { z } = require("zod");

// DEBUG LOG: Initialize
const APP_ID = process.env.WOLFRAM_APP_ID;
if (APP_ID) {
  console.error(`--- [DEBUG] Wolfram App ID found: ${APP_ID.substring(0, 4)}... ---`);
} else {
  console.error("--- [DEBUG] WARNING: WOLFRAM_APP_ID not set ---");
}

module.exports = {
  name: "wolfram_query",
  description: "Query Wolfram Alpha for answers to questions",
  inputSchema: {
    query: z.string().describe("The question or query to send to Wolfram Alpha")
  },
  handler: async ({ query }) => {
    console.error(`--- [DEBUG] Wolfram tool called with query: "${query}" ---`);

    if (!APP_ID) {
      console.error("--- [DEBUG] Failed: No App ID ---");
      return { content: [{ type: "text", text: "Error: WOLFRAM_APP_ID is missing. Please set the environment variable." }] };
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
};
