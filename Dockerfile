FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN apt-get update && apt-get upgrade -y && npm install

RUN npx puppeteer browsers install chrome

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
