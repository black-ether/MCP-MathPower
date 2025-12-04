// Calculator Tool - Mathematical expressions with fraction support
const { create, all } = require('mathjs');
const { z } = require("zod");

// 1. Exact Fractions Engine
const mathFraction = create(all, { number: 'Fraction' });
// 2. Decimal Backup Engine
const mathDecimal = create(all, { number: 'number' });

module.exports = {
  name: "calculate",
  description: "Calculate mathematical expressions with fraction support",
  inputSchema: {
    expression: z.string().describe("The mathematical expression. IMPORTANT: Trigonometry (sin/cos) uses RADIANS by default. If the user asks for DEGREES, you MUST append 'deg' inside the function. Example: 'sin(45 deg)' or 'cos(1/2 deg)'.")
  },
  handler: async ({ expression }) => {
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
};
