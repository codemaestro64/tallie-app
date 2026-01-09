FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
# install only production dependencies
RUN npm install --omit=dev

# persists db in volume
RUN mkdir -p /app/data
ENV DATABASE_URL=file:/app/data/prod.db

EXPOSE 8080
CMD ["npm", "run", "start"]