import * as winston from 'winston';

import { IS_DEV } from './consts';

const logger = winston.createLogger({
  format: winston.format.simple(),
  level: !IS_DEV ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

export default logger;
