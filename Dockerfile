FROM node:argon

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY frontend/package.json package.json
RUN npm install

# Prepare app directory
COPY frontend /usr/src/app

# Build the app
RUN npm run build

EXPOSE 8080

# Start the app
CMD [ "npm", "start" ]
