FROM node:20-slim

WORKDIR /app

# 1. Install dependencies based on package.json
# We copy ONLY package.json first to cache dependencies (makes builds faster)
COPY package.json .
RUN npm install

# 2. Install global tools needed for the bridge
RUN npm install -g mcp_exe

# 3. Copy the rest of your code
COPY . .

# 4. Set permissions
ENV PORT=8080
EXPOSE 8080

# 5. Run the wrapper script
CMD ["node", "start.js"]
