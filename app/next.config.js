/* eslint-disable */
require('dotenv').config();

module.exports = {
  env: {
    BUCKET_FOR_TEAM_AVATARS: process.env.BUCKET_FOR_TEAM_AVATARS,
    STRIPEPUBLISHABLEKEY: process.env.STRIPEPUBLISHABLEKEY,
    BUCKET_FOR_POSTS: process.env.BUCKET_FOR_POSTS,
    LAMBDA_API_ENDPOINT: process.env.LAMBDA_API_ENDPOINT,
    URL_APP: process.env.URL_APP,
    URL_API: process.env.URL_API,
    GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    DEVELOPMENT_URL_API: process.env.DEVELOPMENT_URL_API,
    DEVELOPMENT_URL_APP: process.env.DEVELOPMENT_URL_APP,
    PRODUCTION_URL_API: process.env.PRODUCTION_URL_API,
    PRODUCTION_URL_APP: process.env.PRODUCTION_URL_APP,
    PORT: process.env.PORT,
    PORT_API: process.env.PORT_API,
  },
};