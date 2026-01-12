FROM node:22-slim

RUN corepack enable
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

# Create persistent data directory
RUN mkdir -p /app/data

CMD pnpm start