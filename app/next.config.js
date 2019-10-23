// eslint-disable-next-line
const dotenv = require('dotenv');

// eslint-disable-next-line
const fs = require('fs');

// eslint-disable-next-line
const webpack = require('webpack');

let current = { ...process.env };
const result = dotenv.config();
if (!result.error) {
  current = { ...current, ...result.parsed };
}

let blueprint = { NODE_ENV: process.env.NODE_ENV };
try {
  blueprint = { ...blueprint, ...dotenv.parse(fs.readFileSync('./.env.blueprint', 'utf8')) };
} catch (err) {
  console.log(err);
}
const rules = Object.keys(blueprint).reduce((obj, key) => {
  obj[`process.env.${key}`] = JSON.stringify(current[key]);
  return obj;
}, {});

const config = {
  webpack: (config) => {
    config.plugins = config.plugins || [];

    config.plugins = [
      ...config.plugins,

      // Read the .env file
      new webpack.DefinePlugin(rules),
    ];

    return config;
  },
};

module.exports = config;
