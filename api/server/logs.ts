import * as winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

export default logger;
