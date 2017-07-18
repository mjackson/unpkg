FROM node:alpine

RUN apk update
RUN apk add redis
ENV OPENREDIS_URL redis://localhost:6379
RUN npm -g install yarn

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

COPY . .

ENV NODE_ENV production
RUN yarn build

EXPOSE 5000

CMD (redis-server &) && node initWithNpmrc.js
