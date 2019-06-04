// Only import this file once, at entrypoint
// See https://github.com/motdotla/dotenv/tree/master/examples/typescript

import { config } from 'dotenv';
const result = config();

// Only override process.env if .env file is present and valid
if (!result.error) {
  Object.keys(result.parsed).forEach(key => {
    const value = result.parsed[key];
    if (value && value !== 'undefined') {
      process.env[key] = value;
    }
  });
}
