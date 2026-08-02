# Use Node 18 Alpine for a small footprint
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start the Express server
CMD ["npm", "start"]
