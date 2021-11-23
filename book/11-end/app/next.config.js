// eslint-disable-next-line
require('dotenv').config();

module.exports = {
  env: {
    URL_APP: process.env.URL_APP,
    PORT_APP: process.env.PORT_APP,
    URL_API: process.env.URL_API,
    BUCKET_FOR_AVATARS: process.env.BUCKET_FOR_AVATARS,
    BUCKET_FOR_TEAM_LOGOS: process.env.BUCKET_FOR_TEAM_LOGOS,
    STRIPE_TEST_PUBLISHABLEKEY: process.env.STRIPE_TEST_PUBLISHABLEKEY,
    STRIPE_LIVE_PUBLISHABLEKEY: process.env.STRIPE_LIVE_PUBLISHABLEKEY,
    API_GATEWAY_ENDPOINT: process.env.API_GATEWAY_ENDPOINT,
    PRODUCTION_URL_API: process.env.PRODUCTION_URL_API,
    PRODUCTION_URL_APP: process.env.PRODUCTION_URL_APP,
    GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  },
};
