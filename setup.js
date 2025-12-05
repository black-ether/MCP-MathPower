const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

console.log("\n--- Xiaozhi MCP Server Setup ---");
console.log("We will now securely save your API keys to a .env file.\n");

rl.question('1. Enter your Xiaozhi WebSocket Endpoint (wss://...): ', (endpoint) => {
  rl.question('2. Enter your Wolfram App ID: ', (wolframId) => {
    rl.question('3. Enter your Google API Key: ', (googleKey) => {
      rl.question('4. Enter your Google Search Engine ID (CX): ', (googleCx) => {
    
        // Create the file content
        const content = `PORT=8080
MCP_ENDPOINT=${endpoint.trim()}
WOLFRAM_APP_ID=${wolframId.trim()}
GOOGLE_API_KEY=${googleKey.trim()}
GOOGLE_CX_ID=${googleCx.trim()}
`;

        // Write to .env
        fs.writeFileSync(envPath, content, { encoding: 'utf8' });
        
        console.log("\n[Success] All secrets saved to .env");
        console.log("[Security] Make sure .env is in your .gitignore file!");
        rl.close();
      });
    });
  });
});
