#!/bin/sh

# Navigate to the frontend directory
cd /home/site/wwwroot/my-frontend

# Install frontend dependencies and build the project
npm install
npm run build

# Verify the build directory
if [ ! -d "build" ]; then
  echo "Build directory does not exist"
  exit 1
fi

# Navigate to the backend directory
cd /home/site/wwwroot/my-backend

# Install backend dependencies
npm install

# Verify the server.js file
if [ ! -f "server.js" ]; then
  echo "server.js file does not exist"
  exit 1
fi

# Start the backend server
node server.js
