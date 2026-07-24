#!/bin/bash
set -e

echo "=== V79 Academy Docker Setup ==="

# Check if proxy_network exists, create if missing
if ! docker network ls | grep -q "proxy_network"; then
  echo "Creating docker network 'proxy_network'..."
  docker network create proxy_network
else
  echo "Docker network 'proxy_network' already exists."
fi

echo "Building and starting Docker containers..."
docker compose up -d --build

echo ""
echo "=== Deployment Ready ==="
echo "Application running via Nginx Proxy on port 3030 mapped to port 80 (network: proxy_network)"
echo "Access URL: http://localhost:3030"
