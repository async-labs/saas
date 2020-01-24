import './env';
import * as express from 'express';

const server = express();

server.use(express.json());

server.get('/api/v1/public/get-user', (_, res) => {
  console.log('express server, user object');
  res.json({ user: { email: 'team@builderbook.org' } });
});

server.get('*', (_, res) => {
  res.sendStatus(403);
});

server.listen(process.env.PORT_API, (err) => {
  if (err) {
    throw err;
  }
  console.log(`> Ready on ${process.env.URL_API}`);
});

// import './env';
// import * as express from 'express';
// import api from './api';
// import logger from './logs';

// const server = express();

// server.use(express.json());

// api(server);

// server.get('*', (_, res) => {
//   res.sendStatus(403);
// });

// server.listen(process.env.PORT, (err) => {
//   if (err) {
//     throw err;
//   }
//   logger.info(`> Ready on ${process.env.ROOT_URL}`);
// });
