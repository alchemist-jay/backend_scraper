FROM node:20-bookworm-slim

# Install system dependencies (including required Chromium libs)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxshmfence1 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libgtk-3-0 \
    xdg-utils \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to skip download if you’re using puppeteer-core
ENV PUPPETEER_SKIP_DOWNLOAD true

WORKDIR /app

COPY . /app

RUN chmod -R +x /app

RUN npm install

CMD ["node", "app.js"]
