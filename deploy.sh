#!/bin/sh

echo "Starting deploy script"

# Navigate to the frontend directory
cd my-frontend
echo "Changed to my-frontend directory"

# Install frontend dependencies and build the project
npm install
echo "Frontend dependencies installed"
npm run build
echo "Frontend build completed"

# Verify the build directory
if [ ! -d "build" ]; then
  echo "Build directory does not exist"
  exit 1
fi
echo "Build directory verified"

# Navigate to the backend directory
cd ../my-backend
echo "Changed to my-backend directory"

# Install backend dependencies
npm install
echo "Backend dependencies installed"

# Verify the server.js file
if [ ! -f "server.js" ]; then
  echo "server.js file does not exist"
  exit 1
fi
echo "server.js file verified"

# Start the backend server
nohup node server.js > /dev/null 2>&1 &
echo "Backend server started"

echo "Deployment script completed successfully"
