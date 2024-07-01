#!/bin/bash

# Load environment variables from .env file if needed
if [ -f .env ]; then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

# Navigate to the frontend directory
cd my-frontend

# Install frontend dependencies
npm install

# Build the frontend
npm run build

# Navigate to the backend directory
cd ../my-backend

# Install backend dependencies
npm install

# Start the backend server
node server.js
