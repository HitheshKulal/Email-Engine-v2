# Use Node.js 18.x (or whichever version you are using)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have one) to the container
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port that the app listens on
EXPOSE 4000

# Start the app
CMD ["node", "./dist/app.js"]