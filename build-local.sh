#!/bin/bash

# Service Orders Frontend - Local Build Script
# Alternative to Docker when Docker Hub is not accessible

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Service Orders Frontend - Local Build${NC}"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    echo -e "${YELLOW}   Install with: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"
echo -e "${BLUE}📊 Node.js version: $(node --version)${NC}"
echo -e "${BLUE}📊 npm version: $(npm --version)${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📥 This doesn't appear to be a git repository${NC}"
    echo -e "${YELLOW}   If you haven't cloned the repository yet, please run:${NC}"
    echo -e "${YELLOW}   git clone https://github.com/felipegalobart/service-orders-frontend.git${NC}"
    echo -e "${YELLOW}   cd service-orders-frontend${NC}"
    echo -e "${YELLOW}   ./build-local.sh${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes from repository...${NC}"
git pull origin main

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating environment file...${NC}"
    cp env.production.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your production values before continuing${NC}"
    echo -e "${YELLOW}   Important: Set VITE_API_URL to your API server address${NC}"
    echo -e "${YELLOW}   Example: VITE_API_URL=http://192.168.31.75:3000${NC}"
    read -p "Press Enter after updating the environment file..."
fi

# Check if environment file is properly configured
if grep -q "localhost:3000" ".env"; then
    echo -e "${YELLOW}⚠️  Environment file still contains localhost:3000${NC}"
    echo -e "${YELLOW}   Please update VITE_API_URL to point to your API server${NC}"
    echo -e "${YELLOW}   Example: VITE_API_URL=http://192.168.31.75:3000${NC}"
    read -p "Press Enter after updating the environment file..."
fi

echo -e "${GREEN}✅ Environment file is configured${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Build the application
echo -e "${BLUE}🔨 Building the application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed. No dist directory found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Install serve locally if not already installed
if ! command -v serve &> /dev/null; then
    echo -e "${BLUE}📦 Installing serve locally...${NC}"
    npm install serve
fi

# Start the application
echo -e "${BLUE}🚀 Starting the application...${NC}"
echo -e "${GREEN}✅ Frontend is now running at http://localhost:3000${NC}"
echo -e "${YELLOW}⚠️  Press Ctrl+C to stop the server${NC}"

# Start serve using npx (no global install needed)
npx serve -s dist -l 3000
