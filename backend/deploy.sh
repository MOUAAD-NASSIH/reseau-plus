#!/bin/bash

# Fly.io Deployment Script for reseau-plus-api

echo "=== Deploying reseau-plus-api to Fly.io ==="

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "Error: flyctl not found. Install with: npm install -g flyctl"
    exit 1
fi

# Navigate to backend
cd "$(dirname "$0")"

# Step 1: Launch the app (only first time)
echo "Step 1: Launching Fly app..."
fly launch --name reseau-plus-api --region ams --no-deploy

# Step 2: Set secrets
echo "Step 2: Setting environment secrets..."

# Note: Replace the values below with your actual secrets
# Or set them one by one manually

fly secrets set DATABASE_URL="$DATABASE_URL"
fly secrets set JWT_SECRET="$JWT_SECRET"
fly secrets set CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME"
fly secrets set CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY"
fly secrets set CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET"
fly secrets set EMAIL_USER="$EMAIL_USER"
fly secrets set EMAIL_PASS="$EMAIL_PASS"
fly secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
fly secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
fly secrets set CORS_ORIGIN="https://your-frontend.vercel.app"
fly secrets set FRONTEND_URL="https://your-frontend.vercel.app"

# Step 3: Deploy
echo "Step 3: Deploying..."
fly deploy

# Step 4: Show URL
echo "=== Deployment Complete ==="
echo "Your API is available at: https://reseau-plus-api.fly.dev"
