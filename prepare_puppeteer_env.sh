#!/bin/sh

# Install puppeteer and its dependencies
# Skip Chromium download as we'll use Google Chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer

# Install Google Chrome
apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy google-chrome-stable to the current directory
chrome_path=$(which google-chrome-stable)

if [ -n "$chrome_path" ]; then
    mv "$chrome_path" .
    echo "google-chrome-stable moved to current directory."
else
    echo "not found google-chrome-stable"
    exit 1
fi