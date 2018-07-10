import * as winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.simple(),
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

export default logger;
