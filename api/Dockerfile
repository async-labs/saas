
FROM node:10-alpine as install

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

FROM node:10-alpine as build

# repeated ARG's, see Note in https://docs.docker.com/compose/compose-file/#args
ARG LOG_LEVEL=error
ENV NPM_CONFIG_LOGLEVEL ${LOG_LEVEL}

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

ARG PORT=8000
ENV PORT ${PORT}

COPY --from=install node_modules node_modules
COPY . .

RUN yarn build

FROM node:10-alpine as run

# we don't need the args here cause they're sent at run time
# and we only really need these to run successully (KEEP IT LEAN!)
WORKDIR /usr/src/api
COPY --from=build node_modules node_modules
COPY --from=build production-server production-server
COPY --from=build package.json package.json

EXPOSE ${PORT}

CMD ["yarn", "start"]