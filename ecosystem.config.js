module.exports = {
  apps : [{
    name   : "xiaozhi-mcp",
    script : "bridge.js",
    // No 'env' block needed here anymore! 
    // The bridge.js script loads them from the .env file directly.
  }]
}
