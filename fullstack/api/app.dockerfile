FROM node:8.9.4-alpine

# For local healthcheck
RUN apk add --no-cache curl

RUN mkdir -p /var/app
COPY . /var/app/.
WORKDIR /var/app
RUN yarn

# Expose server listen port
EXPOSE 80

ENTRYPOINT ["yarn", "start"]
