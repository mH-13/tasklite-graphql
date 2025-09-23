FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
EXPOSE 4000
CMD ["node", "--loader", "tsx", "src/index.ts"]
