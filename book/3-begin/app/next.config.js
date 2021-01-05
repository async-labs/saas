require('dotenv').config();

module.exports = {
  env: {
    URL_APP: process.env.URL_APP,
    URL_API: process.env.URL_API,
    PORT_APP: process.env.PORT_APP,
  },
};
