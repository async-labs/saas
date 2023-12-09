// eslint-disable-next-line @typescript-eslint/no-var-requires
const MongoStore = require('connect-mongo');

import * as cors from 'cors';
import * as express from 'express';
import * as session from 'express-session';
import * as httpModule from 'http';
import * as mongoose from 'mongoose';

import api from './api';
import { setupGoogle } from './google-auth';
import { setupPasswordless } from './passwordless-auth';
import { setupSockets } from './sockets';
import { stripeWebhookAndCheckoutCallback } from './stripe';

import logger from './logger';

import * as compression from 'compression';
import helmet from 'helmet';

// eslint-disable-next-line
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 8000;
const MONGO_URL = dev ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;

// check connection
(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URL);
    logger.info('connected to db');

    // async tasks, for ex, inserting email templates to db
    // logger.info('finished async tasks');
  } catch (err) {
    console.log('error: ' + err);
  }
})();

const server = express();

server.use(
  cors({
    origin: dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }),
);

server.use(helmet());
server.use(compression());

stripeWebhookAndCheckoutCallback({ server });

server.use(express.json());

const sessionOptions = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({
    mongoUrl: MONGO_URL,
    ttl: 14 * 24 * 60 * 60, // save session 14 days
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
    domain: dev ? 'localhost' : process.env.COOKIE_DOMAIN,
  } as any,
};

if (!dev) {
  server.set('trust proxy', 1); // sets req.hostname, req.ip
  sessionOptions.cookie.secure = true; // sets cookie over HTTPS only
}

const sessionMiddleware = session(sessionOptions);
server.use(sessionMiddleware);

setupGoogle({ server });
setupPasswordless({ server });

api(server);

const httpServer = httpModule.createServer(server);
setupSockets({
  httpServer,
  origin: dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP,
  sessionMiddleware,
});

server.get('*', (_, res) => {
  res.sendStatus(403);
});

httpServer.listen(port, () => {
  logger.debug('debug right before info');
  logger.info(`> Ready on ${dev ? process.env.URL_API : process.env.PRODUCTION_URL_API}`);
});
