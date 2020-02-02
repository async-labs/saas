import * as winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.simple(),
  level: !process.env.IS_DEV ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

export default logger;
