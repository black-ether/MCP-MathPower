FROM node:20-slim

WORKDIR /app

# Install dependencies defined in package.json
COPY package.json .
RUN npm install

# Copy source code
COPY src/ ./src/

# Environment variables will be injected by Smithery/Cloud Run
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
