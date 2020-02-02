import './env';
import * as express from 'express';

import api from './api';

import logger from './logs';

const server = express();

server.use(express.json());

api(server);

server.get('*', (_, res) => {
  res.sendStatus(403);
});

server.listen(process.env.PORT_API, (err) => {
  if (err) {
    throw err;
  }
  logger.info(`> Ready on ${process.env.URL_API}`);
});
