FROM node:18-alpine as builder

WORKDIR /app

# Set Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package files
COPY package*.json ./

# Install dependencies with better caching
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application with memory optimization
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 