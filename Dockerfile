FROM node:argon

# Prepare app directory
COPY . /usr/src/app

# Install dependencies
WORKDIR /usr/src/app
RUN npm install

# Build the app
RUN npm build

# Expose the app port
EXPOSE 8080

#Hmm, we should switch user here, shouldn't run as root...
#
# Start the app
CMD [ "npm", "start" ]
