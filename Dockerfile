FROM node:argon

# Prepare app directory
RUN mkdir -p /usr/src/app
ADD . /usr/src/app

# Install dependencies
WORKDIR /usr/src/app
RUN npm install

# Build the app
RUN npm build

# Expose the app port
EXPOSE 8080

# Start the app
# CMD npm start
CMD [ "npm", "start" ]