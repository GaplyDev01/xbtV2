#!/bin/bash

# Fix for Vercel deployment issues
echo "Setting up deployment environment..."

# Ensure npm is installed correctly
if ! command -v npm &> /dev/null; then
    echo "npm could not be found, attempting to install Node.js"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install vite globally to ensure it's available
echo "Installing vite globally..."
npm install -g vite

# Install dependencies
echo "Installing project dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

echo "Deployment setup complete!" 