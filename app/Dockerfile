
FROM node:10-alpine as appbuilder

ARG LOG_LEVEL=error
ENV NPM_CONFIG_LOGLEVEL ${LOG_LEVEL}

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

# build dependencies, this one does not have bcrypt, but it may be required by other deps
RUN apk --no-cache add --update --no-progress --virtual builds-deps build-base python 

COPY package.json .
COPY yarn.lock .

RUN yarn install --ignore-scripts --frozen-lockfile --ignore-optional

FROM node:10-alpine

# repeated ARG's, see Note in https://docs.docker.com/compose/compose-file/#args
ARG LOG_LEVEL=error
ENV NPM_CONFIG_LOGLEVEL ${LOG_LEVEL}

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

ARG PORT=3000
ENV PORT ${PORT}

WORKDIR /usr/src/app
COPY --from=appbuilder node_modules node_modules
COPY . .

RUN yarn build

EXPOSE ${PORT}

CMD ["yarn", "start"]