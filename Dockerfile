FROM node:argon

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package.json
RUN npm install

# Prepare app directory
COPY webpack.config.js /usr/src/app/
COPY server.js /usr/src/app/
COPY robots.txt /usr/src/app/
COPY package.json /usr/src/app/
COPY index.html /usr/src/app/
COPY droneCharts.html /usr/src/app/
COPY css /usr/src/app/css
COPY src /usr/src/app/src
COPY .babelrc /usr/src/app/

# Build the app
RUN npm run build

EXPOSE 8080

# Start the app
CMD [ "npm", "start" ]
