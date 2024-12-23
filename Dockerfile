# Use Node.js 20.18.0 as the base image
FROM node:20.18.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the .env file to the working directory
COPY .env .env

# Set environment to production
ENV NODE_ENV=production

# Install global NestJS CLI
RUN npm install -g @nestjs/cli

# Install production dependencies
RUN npm install --production

# Copy the entire source code into the container
COPY . .

# Build the app
RUN npm run build

# Expose the port for the application
EXPOSE 5000

# Command to start the application
CMD ["npm", "run", "start:prod"]
