# Professionalized MCP Server Structure

## What Changed

Your project has been refactored to follow professional MCP server standards.

### New Structure

```
xiaozhi-super-server/
├── src/
│   ├── index.js          # Main consolidated MCP server
│   └── tools/
│       ├── calculator.js # Math calculations with fractions
│       ├── wolfram.js    # Wolfram Alpha integration
│       └── time.js       # Current time tool
├── package.json          # Dependencies & run commands
├── smithery.yaml         # Hosting platform configuration
├── Dockerfile            # Docker containerization
└── README.md
```

### Key Improvements

1. **Consolidated Server** - All tools run in a single Node.js process (`src/index.js`) instead of separate scripts
2. **Smithery.yaml** - Enables one-click deployment to hosting platforms with automatic configuration UI
3. **Cleaner Dockerfile** - Uses package.json for dependencies instead of inline installs
4. **Professional Package.json** - Properly defines scripts, metadata, and dependencies

### Running Locally

```bash
npm install
npm start
```

### Environment Variables

Set these before running:
- `WOLFRAM_APP_ID` - Your Wolfram Alpha App ID (required for wolfram_query tool)
- `PORT` - Port for health check server (default: 8080)

### Deploying to Hosting Platforms

The `smithery.yaml` file enables deployment to platforms like Smithery, Glama, or Render:
1. Push this repo to GitHub
2. Connect to hosting platform
3. Platform will automatically prompt for `WOLFRAM_APP_ID`
4. One-click deploy!

### Old Files (Can Delete)

The following files are superseded by the new structure but left for reference:
- `start.js` - Replaced by `src/index.js`
- `calculator.js` - Moved to `src/tools/calculator.js`
- `wolfram.js` - Moved to `src/tools/wolfram.js`
- `time-server.js` - Moved to `src/tools/time.js`
- `mcp.json` - No longer needed; config is in `src/index.js`
