import './env';
import * as cors from 'cors';
import * as express from 'express';
import * as mongoose from 'mongoose';

import api from './api';

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGO_URL_TEST, options);

const server = express();

server.use(
  cors({
    origin: process.env.URL_APP,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }),
);

server.use(express.json());

api(server);

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

// server.listen(process.env.PORT_API, (err) => {
//   if (err) {
//     throw err;
//   }
//   logger.info(`> Ready on ${process.env.URL_API}`);
// });
