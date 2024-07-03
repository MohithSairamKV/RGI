#!/bin/bash

echo "Starting deployment script..." > /home/site/deploy.log

# Navigate to the frontend directory
cd my-frontend
echo "In frontend directory: $(pwd)" >> /home/site/deploy.log

# Install frontend dependencies
npm install >> /home/site/deploy.log 2>&1

# Build the frontend
npm run build >> /home/site/deploy.log 2>&1

# Serve the frontend build
npx serve -s build -l 3000 --name frontend &

# Navigate to the backend directory
cd ../my-backend
echo "In backend directory: $(pwd)" >> /home/site/deploy.log

# Install backend dependencies
npm install >> /home/site/deploy.log 2>&1

# Start the backend server
node server.js >> /home/site/deploy.log 2>&1

echo "Deployment script finished." >> /home/site/deploy.log
