const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper for asking questions
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("\n🔍 --- Wolfram Alpha API Direct Debugger --- 🔍");
  console.log("Test different API modes to see what your AI will 'read'.");

  // 1. Ask for App ID
  require('dotenv').config(); 
  const defaultId = process.env.WOLFRAM_APP_ID || "";
  
  let appId = await ask(`\nEnter App ID [Press Enter to use ${defaultId ? defaultId.substring(0,6)+'...' : 'None'}]: `);
  if (!appId.trim()) appId = defaultId;

  if (!appId) {
    console.error("❌ Error: You must provide an App ID.");
    rl.close();
    return;
  }

  // 2. Ask for API Type
  console.log("\nSelect API Mode:");
  console.log("  1. LLM API (Current Standard - Concise Paragraphs)");
  console.log("  2. Full Results API (v2/query - Massive JSON)");
  console.log("  3. Simple API (Returns an Image URL)");
  console.log("  4. Spoken Results API (v1/spoken - Single Sentence for Voice)"); // <--- NEW OPTION
  
  const choice = await ask("Choice [1]: ");
  let type = 'llm';
  if (choice.trim() === '2') type = 'full';
  if (choice.trim() === '3') type = 'simple';
  if (choice.trim() === '4') type = 'spoken';

  // 3. Ask for Query
  const query = await ask("\nEnter your Question: ");
  if (!query.trim()) {
    console.log("❌ Empty query.");
    rl.close();
    return;
  }

  // 4. Construct URL
  let url = "";
  if (type === 'full') {
    url = `http://api.wolframalpha.com/v2/query?appid=${appId}&input=${encodeURIComponent(query)}&output=json`;
  } else if (type === 'simple') {
    url = `http://api.wolframalpha.com/v1/simple?appid=${appId}&input=${encodeURIComponent(query)}`;
  } else if (type === 'spoken') {
    // Spoken API URL
    url = `https://api.wolframalpha.com/v1/spoken?appid=${appId}&i=${encodeURIComponent(query)}`;
  } else {
    url = `https://www.wolframalpha.com/api/v1/llm-api?appid=${appId}&input=${encodeURIComponent(query)}`;
  }

  console.log(`\n🚀 Sending request to Wolfram Alpha (${type})...`);
  console.log(`🔗 URL: ${url}`);

  try {
    const response = await fetch(url);
    
    if (type === 'simple') {
        if (response.ok) {
            console.log("\n✅ SUCCESS: API returned a valid image.");
            console.log("   (Cannot display binary image in terminal)");
            console.log(`   URL to view in browser: ${url}`);
        } else {
            console.log(`❌ HTTP Error: ${response.status}`);
            console.log(await response.text());
        }
    } else {
        const text = await response.text();
        console.log("\n⬇️  --- RAW API RESPONSE --- ⬇️\n");
        
        if (type === 'full') {
            try {
                const jsonObj = JSON.parse(text);
                console.log(JSON.stringify(jsonObj, null, 2));
            } catch {
                console.log(text);
            }
        } else {
            // This displays the plain text answer for Spoken/LLM
            console.log(text);
        }
        console.log("\n⬆️  ------------------------ ⬆️");
    }

  } catch (err) {
    console.error(`\n❌ Network Error: ${err.message}`);
  }

  rl.close();
}

main();
