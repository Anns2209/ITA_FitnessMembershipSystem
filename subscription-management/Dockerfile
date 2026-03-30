FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && npm install --build-from-source \
    && apt-get purge -y --auto-remove \
    && rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 50051

CMD ["npm", "start"]
