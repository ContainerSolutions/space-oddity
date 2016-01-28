FROM node:argon

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package.json
RUN npm install

# Prepare app directory
COPY . /usr/src/app

# Build the app
RUN npm build

EXPOSE 80

# Start the app
CMD [ "npm", "start" ]
