
FROM node:10-alpine as install

ARG LOG_LEVEL=error
ENV NPM_CONFIG_LOGLEVEL ${LOG_LEVEL}

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

COPY package.json .
COPY yarn.lock .

RUN yarn install --ignore-scripts --frozen-lockfile --ignore-optional

FROM node:10-alpine as build

# repeated ARG's, see Note in https://docs.docker.com/compose/compose-file/#args
ARG LOG_LEVEL=error
ENV NPM_CONFIG_LOGLEVEL ${LOG_LEVEL}

ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}

ARG PORT=3000
ENV PORT ${PORT}

ARG API_PORT=8000
ENV API_PORT ${API_PORT}

ARG URL_API 
ENV URL_API ${URL_API}

ARG URL_APP 
ENV URL_APP ${URL_APP}

ARG LAMBDA_API_ENDPOINT 
ENV LAMBDA_API_ENDPOINT ${LAMBDA_API_ENDPOINT}

ARG STRIPEPUBLISHABLEKEY 
ENV STRIPEPUBLISHABLEKEY ${STRIPEPUBLISHABLEKEY}

ARG BUCKET_FOR_POSTS 
ENV BUCKET_FOR_POSTS ${BUCKET_FOR_POSTS}

ARG BUCKET_FOR_TEAM_AVATARS 
ENV BUCKET_FOR_TEAM_AVATARS ${BUCKET_FOR_TEAM_AVATARS}

ARG GA_TRACKING_ID
ENV GA_TRACKING_ID ${GA_TRACKING_ID}

# next is more eager, and requires most of the source code
# so here we don't have an intermediate stage, we build and are
# ready to run.
WORKDIR /usr/src/app
COPY --from=install node_modules node_modules
COPY . .

RUN yarn build

EXPOSE ${PORT}

CMD ["yarn", "start"]