// eslint-disable-next-line @typescript-eslint/no-var-requires
const MongoStore = require('connect-mongo');

import * as cors from 'cors';
import * as express from 'express';
import * as session from 'express-session';
import * as mongoose from 'mongoose';

import api from './api';
import { setupGoogle } from './google-auth';

// eslint-disable-next-line
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL_TEST);

const server = express();

server.use(
  cors({
    origin: process.env.URL_APP,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }),
);

server.use(express.json());

const sessionOptions = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL_TEST,
    ttl: 14 * 24 * 60 * 60, // save session 14 days
    autoRemove: 'interval',
    autoRemoveInterval: 1440, // clears every day
  }),
  cookie: {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
    secure: false,
  },
};

const sessionMiddleware = session(sessionOptions);
server.use(sessionMiddleware);

setupGoogle({ server });

api(server);

server.get('*', (_, res) => {
  res.sendStatus(403);
});

server.listen(process.env.PORT_API, () => {
  console.log(`> Ready on ${process.env.URL_API}`);
});
