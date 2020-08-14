import './env';
import * as mongoSessionStore from 'connect-mongo';
import * as cors from 'cors';
import * as express from 'express';
import * as session from 'express-session';
import * as httpModule from 'http';
import * as mongoose from 'mongoose';

import api from './api';
import { setupGoogle } from './google-auth';
import { setupPasswordless } from './passwordless-auth';
import { setup as setupSockets } from './sockets';
import { stripeWebhookAndCheckoutCallback } from './stripe';

import logger from './logs';
import setupSitemapAndRobots from './setupSitemapAndRobots';

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

const dev = process.env.NODE_ENV !== 'production';

mongoose.connect(dev ? process.env.MONGO_URL_TEST : process.env.MONGO_URL, options);

const server = express();

server.use(
  cors({ origin: dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP, credentials: true }),
);

stripeWebhookAndCheckoutCallback({ server });

server.use(express.json());

const MongoStore = mongoSessionStore(session);

const sessionOptions = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 14 * 24 * 60 * 60, // save session 14 days
    autoRemove: 'interval',
    autoRemoveInterval: 1440, // clears every day
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
    secure: false,
  },
};

const sessionMiddleware = session(sessionOptions);
server.use(sessionMiddleware);

setupGoogle({ server });
setupPasswordless({ server });

api(server);

const http = new httpModule.Server(server);
setupSockets({
  http,
  origin: dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP,
  sessionMiddleware,
});

setupSitemapAndRobots({ server });

server.get('*', (_, res) => {
  res.sendStatus(403);
});

http.listen(process.env.PORT_API, () => {
  logger.info(`> Ready on ${dev ? process.env.URL_API : process.env.PRODUCTION_URL_API}`);
});
