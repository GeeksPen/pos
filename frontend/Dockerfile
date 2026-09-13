FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the files
COPY . .

# Build the Next.js app
RUN npm run build

# Start the Next.js application
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
