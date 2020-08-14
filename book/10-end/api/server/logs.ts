import * as winston from 'winston';

const dev = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  format: winston.format.simple(),
  level: !dev ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

export default logger;
