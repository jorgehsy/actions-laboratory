#!/bin/bash

echo "🚀 Setting up React Docker environment with SSL for panteon.dev"

# Create directory structure
mkdir -p nginx/certs
mkdir -p react-app

# Check if hosts entry exists
if ! grep -q "127.0.0.1 panteon.dev" /etc/hosts; then
    echo "📝 Adding panteon.dev to /etc/hosts (requires sudo)"
    echo "127.0.0.1 panteon.dev" | sudo tee -a /etc/hosts
else
    echo "✅ panteon.dev already in /etc/hosts"
fi

# Generate self-signed SSL certificate
echo "🔐 Generating self-signed SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/certs/panteon.dev.key \
    -out nginx/certs/panteon.dev.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=panteon.dev" \
    -addext "subjectAltName=DNS:panteon.dev,DNS:*.panteon.dev"

# Create React app if it doesn't exist
if [ ! -f "react-app/package.json" ]; then
    echo "⚛️  Creating new React app..."
    npx create-react-app react-app
else
    echo "✅ React app already exists"
fi

# Create .env file for React
echo "🔧 Creating React .env configuration..."
cat > react-app/.env << EOF
# Disable host check for Docker
DANGEROUSLY_DISABLE_HOST_CHECK=true

# Enable polling for file changes in Docker
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true

# WebSocket configuration
WDS_SOCKET_PORT=0

# Port configuration
PORT=3000
EOF

# Remove any HTTPS or HOST settings from package.json scripts
echo "🔧 Configuring React for Docker..."
cd react-app
if command -v jq &> /dev/null; then
    jq '.proxy = "http://react-app:3000"' package.json > package.json.tmp && mv package.json.tmp package.json
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the containers: docker-compose up -d"
echo "2. View logs: docker-compose logs -f"
echo "3. Access your app:"
echo "   - https://panteon.dev (port 443)"
echo "   - https://panteon.dev:3000 (port 3000)"
echo ""
echo "⚠️  Note: Your browser will show a security warning because the SSL certificate is self-signed."
echo "   This is normal for local development. Click 'Advanced' and proceed anyway."
echo ""
echo "🛑 To stop: docker-compose down"