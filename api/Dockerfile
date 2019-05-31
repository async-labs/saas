
FROM node:10-alpine
ENV NPM_CONFIG_LOGLEVEL error
# ENV NODE_ENV production

# see https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions#alpine-linux-based-images
RUN apk --no-cache add --update --no-progress --virtual builds-deps build-base python 


ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

RUN mkdir -p /usr/src/app

RUN addgroup -S nodejs && adduser -S nodejs

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install --production --ignore-scripts --frozen-lockfile

# see https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions#alpine-linux-based-images
RUN npm rebuild bcrypt --build-from-source

ENV HOST "0.0.0.0"
ENV PORT 8000
EXPOSE 8000

COPY production-server .

RUN chown -R nodejs:nodejs . && \
  chmod 744 -R .

USER nodejs

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "app"]