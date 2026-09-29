#!/usr/bin/env bash
set -e
if [ ! -f .env ]; then cp .env.example .env; echo "Created .env. Set a strong ADMIN_PASSWORD before deployment."; fi
echo "Starting Gubali High School Portal at http://localhost:3000"
node server.js
