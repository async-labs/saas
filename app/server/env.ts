// Only import this file once, at entrypoint
// See https://github.com/motdotla/dotenv/tree/master/examples/typescript

import { config } from 'dotenv';

const result = config();
if (result.error) {
  throw result.error;
}
