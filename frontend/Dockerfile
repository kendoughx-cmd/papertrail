# frontend/Dockerfile
FROM node:22-slim

WORKDIR /app

# Copy package.json and yarn.lock first to install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the application code
COPY . .

# Expose the port that Vite serves on
EXPOSE 5173

# Start the Vite development server
CMD ["yarn", "dev"]
