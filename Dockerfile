# Stage 1: Build the React Application
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm install

# Copy source code and build assets
COPY . .
RUN npm run build

# Stage 2: Serve using high-performance Nginx Alpine
FROM nginx:1.25-alpine

# Copy built HTML/JS/CSS assets to Nginx default public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to handle React SPA browser routes correctly
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
