import './env';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as path from 'path';
import api from './api';
import logger from './logs';
import { PORT_API as PORT, URL_API as ROOT_URL, URL_APP } from './consts';

const server = express();

server.use(cors({ origin: URL_APP, credentials: true }));

server.use(helmet());
server.use(compression());

server.use(express.json());

api(server);

server.get('/robots.txt', (_, res) => {
  res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
});

server.get('*', (_, res) => {
  res.sendStatus(403);
});

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  logger.info(`> Ready on ${ROOT_URL}`);
});
