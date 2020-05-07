require('dotenv').config();

module.exports = {
  env: {
    URL_APP: process.env.URL_APP,
    PORT_APP: process.env.PORT_APP,
    URL_API: process.env.URL_API,
    BUCKET_FOR_AVATARS: process.env.BUCKET_FOR_AVATARS,
  },
};
