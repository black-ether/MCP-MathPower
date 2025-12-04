const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { create, all } = require('mathjs');
const { z } = require("zod");

// 1. Exact Fractions Engine
const mathFraction = create(all, { number: 'Fraction' });
// 2. Decimal Backup Engine
const mathDecimal = create(all, { number: 'number' });

const server = new McpServer({
  name: "calculator",
  version: "6.0.0" // Version bump for "Degree Awareness"
});

server.tool(
  "calculate",
  {
    expression: z.string().describe("The mathematical expression. IMPORTANT: Trigonometry (sin/cos) uses RADIANS by default. If the user asks for DEGREES, you MUST append 'deg' inside the function. Example: 'sin(45 deg)' or 'cos(1/2 deg)'.")
  },
  async ({ expression }) => {
    if (!expression || expression.trim() === "") {
      return { content: [{ type: "text", text: "Error: Empty expression." }] };
    }

    try {
      // PLAN A: Exact Fractions
      const result = mathFraction.evaluate(expression);
      const formatted = mathFraction.format(result, { fraction: 'ratio' });
      return { content: [{ type: "text", text: formatted }] };
    } catch (err) {
      // PLAN B: Decimals (Backup)
      try {
        const result = mathDecimal.evaluate(expression);
        // We format with 14 digits of precision for accuracy
        const formatted = mathDecimal.format(result, { precision: 14 });
        return { content: [{ type: "text", text: formatted + " (decimal approx)" }] };
      } catch (err2) {
        return { content: [{ type: "text", text: "Error: " + err2.message }] };
      }
    }
  }
);

const transport = new StdioServerTransport();
server.connect(transport);
