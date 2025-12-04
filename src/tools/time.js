// Time Tool - Get current time in ISO format
module.exports = {
  name: "get_time",
  description: "Get the current time",
  inputSchema: {},
  handler: async () => {
    return {
      content: [{
        type: "text",
        text: "The current time is: " + new Date().toISOString()
      }]
    };
  }
};
