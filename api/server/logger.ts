import * as winston from 'winston';

const dev = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  format: winston.format.simple(),
  level: dev ? 'debug' : 'info',
  transports: [new winston.transports.Console()],
});

export default logger;
