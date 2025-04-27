# Build Stage
FROM node:20.11.1-alpine3.18 as builder

# Install build dependencies for native modules
RUN apk add --no-cache build-base python3 cairo-dev pango-dev jpeg-dev giflib-dev

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app
COPY . ./

# Generate Prisma client
RUN npx prisma db push
RUN npx prisma generate

# Post-install scripts (for things like `next install`)
RUN npm run postinstall

# Build the Next.js app
COPY .env .env.production
ENV NODE_ENV=production
RUN npm run build

# Run Stage
FROM node:20-alpine

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

# Start the app using Next.js
CMD ["npm", "run", "start"]