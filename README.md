# Xiaozhi Super Server

This project provides a server compatible with the Model-View-Controller (MVC) architecture, extending Xiaozhi with powerful mathematical and computational tools. It includes a calculator with fraction support and a Wolfram Alpha query tool.

## Features

- **Time Tool:** Get the current time in ISO format.
- **Calculator Tool:** Evaluate mathematical expressions with support for precise fractions, falling back to decimals when necessary.
- **Wolfram Alpha Tool:** Query the Wolfram Alpha LLM API for complex questions and computations.

## Setup

1. **Prerequisites:**
   - Node.js (version 18.0.0 or higher)
   - `mcp_exe` (MCP Connector executable) in your system's PATH.

2. **Installation:**
   - Clone this repository.
   - Install the dependencies:
     ```bash
     npm install
     ```

3. **Configuration:**
   - Run the setup script to create a `.env` file with your credentials:
     ```bash
     node setup.js
     ```
   - You will be prompted for the following:
     - **Xiaozhi WebSocket Endpoint:** Your `wss://` endpoint.
     - **Wolfram App ID:** Your app ID for the Wolfram Alpha API.

## Running the Server

There are two ways to run the server:

### 1. Using `pm2` (Recommended for Production)

This method uses `pm2`, a process manager for Node.js, to run the server in the background.

```bash
pm2 start ecosystem.config.js
```

To monitor the server:
```bash
pm2 logs xiaozhi-mcp
```

### 2. Direct Node Execution (for Development)

This method runs the bridge script directly.

```bash
node bridge.js
```

## Docker Deployment

The project includes a `Dockerfile` for easy containerization.

1. **Build the Docker image:**
   ```bash
   docker build -t xiaozhi-super-server .
   ```

2. **Run the Docker container:**
   - Make sure to pass the `MCP_ENDPOINT` and `WOLFRAM_APP_ID` environment variables.
   ```bash
   docker run -d -p 8080:8080 \
     -e MCP_ENDPOINT="<your_wss_endpoint>" \
     -e WOLFRAM_APP_ID="<your_wolfram_app_id>" \
     --name xiaozhi-server \
     xiaozhi-super-server
   ```
The server will be running on port 8080 inside the container.
