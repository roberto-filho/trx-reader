FROM node:10.12.0-alpine

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json yarn.lock ./

RUN yarn install --production

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "yarn", "start" ]