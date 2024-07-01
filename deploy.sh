#!/bin/bash



# Navigate to the backend folder and install dependencies
cd my-backend
npm install

# Start the backend server in the background
nohup npm start &

# Navigate back to the root and install frontend dependencies
cd ..
cd my-frontend
npm install

# Build the frontend application
npm run build

echo "Deployment completed successfully."
