#!/bin/bash

# Service Orders Frontend - Homelab Deployment Script
# This script helps deploy the React frontend to your homelab environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="service-orders-frontend"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
ENV_EXAMPLE="env.production.example"

echo -e "${BLUE}🚀 Service Orders Frontend - Homelab Deployment${NC}"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Determine which compose command to use
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git is installed${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📥 This doesn't appear to be a git repository${NC}"
    echo -e "${YELLOW}   If you haven't cloned the repository yet, please run:${NC}"
    echo -e "${YELLOW}   git clone https://github.com/felipegalobart/service-orders-frontend.git${NC}"
    echo -e "${YELLOW}   cd service-orders-frontend${NC}"
    echo -e "${YELLOW}   ./deploy-frontend.sh${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes from repository...${NC}"
git pull origin main

# Create environment file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}📝 Creating environment file...${NC}"
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo -e "${YELLOW}⚠️  Please edit $ENV_FILE with your production values before continuing${NC}"
    echo -e "${YELLOW}   Important: Set VITE_API_URL to your API server address${NC}"
    echo -e "${YELLOW}   Example: VITE_API_URL=http://192.168.31.75:3000${NC}"
    read -p "Press Enter after updating the environment file..."
fi

# Check if environment file is properly configured
if grep -q "localhost:3000" "$ENV_FILE"; then
    echo -e "${YELLOW}⚠️  Environment file still contains localhost:3000${NC}"
    echo -e "${YELLOW}   Please update VITE_API_URL to point to your API server${NC}"
    echo -e "${YELLOW}   Example: VITE_API_URL=http://192.168.31.75:3000${NC}"
    read -p "Press Enter after updating the environment file..."
fi

echo -e "${GREEN}✅ Environment file is configured${NC}"

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
$COMPOSE_CMD down 2>/dev/null || true

# Remove old images to force rebuild
echo -e "${BLUE}🗑️  Removing old images...${NC}"
$COMPOSE_CMD down --rmi all 2>/dev/null || true

# Build and start services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
$COMPOSE_CMD up --build -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 15

# Check service health
echo -e "${BLUE}🏥 Checking service health...${NC}"

# Check if the frontend is responding
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy and responding${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    $COMPOSE_CMD logs frontend
    exit 1
fi

# Check if API is accessible (optional)
echo -e "${BLUE}🏥 Checking API connectivity...${NC}"
API_URL=$(grep "VITE_API_URL" "$ENV_FILE" | cut -d'=' -f2)
if [ -n "$API_URL" ]; then
    if curl -f "$API_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is accessible at $API_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  API not accessible at $API_URL${NC}"
        echo -e "${YELLOW}   Make sure your API server is running and accessible${NC}"
    fi
fi

# Display service information
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📊 Service Information:${NC}"
echo "  • Frontend: http://localhost:3001"
echo "  • API URL: $API_URL"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo "  • View logs: $COMPOSE_CMD logs -f"
echo "  • Stop services: $COMPOSE_CMD down"
echo "  • Restart services: $COMPOSE_CMD restart"
echo "  • Update services: git pull && $COMPOSE_CMD up -d --build"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "  • Check status: $COMPOSE_CMD ps"
echo "  • View frontend logs: $COMPOSE_CMD logs -f frontend"
echo "  • Access container: $COMPOSE_CMD exec frontend sh"
echo ""
echo -e "${BLUE}🌐 Nginx Configuration:${NC}"
echo "  • Add this to your Nginx config to serve the frontend:"
echo "    location / {"
echo "        proxy_pass http://localhost:3001;"
echo "        proxy_set_header Host \$host;"
echo "        proxy_set_header X-Real-IP \$remote_addr;"
echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
echo "    }"
echo ""
echo -e "${YELLOW}⚠️  Security Notes:${NC}"
echo "  • Configure SSL certificates for HTTPS"
echo "  • Set up proper firewall rules"
echo "  • Consider using a reverse proxy (Nginx) for production"
echo ""
echo -e "${GREEN}🚀 Your Service Orders Frontend is now running in your homelab!${NC}"
