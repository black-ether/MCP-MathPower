FROM node:20-slim

WORKDIR /app

# Install dependencies
RUN npm init -y &&     npm install -g mcp_exe &&     npm install @modelcontextprotocol/sdk mathjs zod

# Copy all scripts
COPY time-server.js .
COPY calculator.js .
COPY wolfram.js .
COPY mcp.json .
COPY start.js .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "start.js"]
