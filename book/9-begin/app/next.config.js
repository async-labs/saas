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
  },
};
