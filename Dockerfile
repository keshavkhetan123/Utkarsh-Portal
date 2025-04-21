## Base ########################################################################
# Use a larger node image to do the build for native deps (e.g., gcc, python)
FROM node:20.11.1-alpine3.18 as base

# Reduce npm log spam and colour during install within Docker
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV REACT_APP_GC_ENV=localhost

RUN apk add build-base python3 cairo-dev pango-dev jpeg-dev giflib-dev

# We'll run the app as the `node` user, so put it in their home directory
WORKDIR /app

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm i

COPY . ./
RUN npx prisma generate
RUN npm run postinstall

# # Build Stage
# FROM node:20.11.1-alpine3.18 as builder

# # Install build dependencies for native modules
# RUN apk add --no-cache build-base python3 cairo-dev pango-dev jpeg-dev giflib-dev

# WORKDIR /app

# # Install dependencies
# COPY package.json package-lock.json ./
# RUN npm ci

# # Copy the rest of the app
# COPY . ./

# # Generate Prisma client
# RUN npx prisma generate

# # Post-install scripts (for things like `next install`)
# RUN npm run postinstall

# # Build the Next.js app
# COPY .env .env.production
# ENV NODE_ENV=production
# RUN npm run build

# # Run Stage
# FROM node:20-alpine

# WORKDIR /app

# # Copy built app from builder stage
# COPY --from=builder /app ./

# # Expose port
# EXPOSE 3000

# # Start the app using Next.js
# CMD ["npm", "run", "start"]

