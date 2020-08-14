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

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGO_URL, options);

const server = express();

server.use(cors({ origin: process.env.URL_APP, credentials: true }));

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
setupSockets({ http, origin: process.env.URL_APP, sessionMiddleware });

server.get('*', (_, res) => {
  res.sendStatus(403);
});

http.listen(process.env.PORT_API, () => {
  console.log(`> Ready on ${process.env.URL_API}`);
});
