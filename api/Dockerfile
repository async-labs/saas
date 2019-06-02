
FROM node:10-alpine as apibuilder

ARG LOG_LEVEL=error
ENV NPM_CONFIG_LOGLEVEL ${LOG_LEVEL}

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

# build dependencies, see https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions#alpine-linux-based-images
RUN apk --no-cache add --update --no-progress --virtual builds-deps build-base python 

COPY package.json .
COPY yarn.lock .

RUN yarn install --force --ignore-scripts --frozen-lockfile --ignore-optional

RUN npm rebuild bcrypt --build-from-source

FROM node:10-alpine

# repeated ARG's, see Note in https://docs.docker.com/compose/compose-file/#args
ARG LOG_LEVEL=error
ENV NPM_CONFIG_LOGLEVEL ${LOG_LEVEL}

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

ARG PORT=8000
ENV PORT ${PORT}

WORKDIR /usr/src/api
COPY --from=apibuilder node_modules node_modules
COPY . .

RUN yarn build

EXPOSE ${PORT}

CMD ["yarn", "start"]