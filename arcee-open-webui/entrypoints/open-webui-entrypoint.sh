#!/usr/bin/env bash

set -euo pipefail

########################
# Branding
# See Dockerfile for Arcee branding, this entrypoint
# allows customer-provided images to be used instead
########################

# If the LOGO_IMAGE_URL is present, download it and save to:
# /app/backend/static/favicon.png
# /app/build/static/favicon.png
# /app/build/favicon.png
if [ -n "${LOGO_IMAGE_URL:-}" ]; then
    echo "Downloading logo from $LOGO_IMAGE_URL"
    curl -s "$LOGO_IMAGE_URL" -o /tmp/logo.png
    cp /tmp/logo.png /app/backend/static/favicon.png
    cp /tmp/logo.png /app/build/static/favicon.png
    cp /tmp/logo.png /app/build/favicon.png
    rm /tmp/logo.png
    echo "Logo downloaded and saved successfully"
fi

# If the LOGO_IMAGE_URL is present, download it and save to:
# /app/build/static/splash.png
if [ -n "${SPLASH_IMAGE_URL:-}" ]; then
    echo "Downloading splash from $SPLASH_IMAGE_URL"
    curl -s "$SPLASH_IMAGE_URL" -o /tmp/splash.png
    cp /tmp/splash.png /app/build/static/splash.png
fi


# Start the app, this is the default CMD in the open-webui dockerfile
exec "./start.sh"
