# Use a stable Node.js base image
FROM node:18

# Set the working directory
WORKDIR /service-a

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm ci

# Install dependencies
RUN npm install

# Ensure `nodemon`, `typescript`, and `ts-node` are installed globally
RUN npm install -g nodemon ts-node typescript

# Copy the rest of the application code
COPY . .

# Ensure environment variables are loaded
ENV NODE_ENV=development

# Expose the application port
EXPOSE 3000

ENTRYPOINT ["nodemon", "--legacy-watch", "src/index.ts"]

# Start the application using the `start` script defined in package.json
CMD ["npm", "start"]
