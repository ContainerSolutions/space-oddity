FROM node:argon

# Prepare app directory
COPY . /usr/src/app

ADD package.json package.json

# Install dependencies
WORKDIR /usr/src/app
RUN npm install

# Build the app
RUN npm build

EXPOSE 80

# Start the app
CMD [ "npm", "start" ]