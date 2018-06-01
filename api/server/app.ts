import * as express from 'express';
import * as session from 'express-session';
import * as cors from 'cors';
import * as compression from 'compression';
import * as mongoSessionStore from 'connect-mongo';
import * as mongoose from 'mongoose';
import * as helmet from 'helmet';
import * as path from 'path';

import auth from './google';
import api from './api';
import { signRequestForLoad } from './aws-s3';

import logger from './logs';
import Team from './models/Team';

require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 8000;
const ROOT_URL = dev ? `http://localhost:${port}` : 'https://app1.async-await.com';

let MONGO_URL = dev ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;

mongoose.connect(MONGO_URL);

const server = express();

server.use(
  cors({
    origin: dev ? 'http://localhost:3000' : 'https://app.builderbook.org',
    credentials: true,
  }),
);

server.use(helmet());
server.use(compression());
server.use(express.json());

const MongoStore = mongoSessionStore(session);
const sess = {
  name: 'async-await.sid',
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 14 * 24 * 60 * 60, // save session 14 days
  }),
  resave: false,
  saveUninitialized: false,
  cookie: <any>{
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
    domain: dev ? 'localhost' : '.async-await.com',
  },
};

if (!dev) {
  server.set('trust proxy', 1); // sets req.hostname, req.ip
  sess.cookie.secure = true; // sets cookie over HTTPS only
}

server.use(session(sess));

auth({ server, ROOT_URL });
api(server);

server.get('/uploaded-file', async (req, res) => {
  if (!req.user) {
    res.redirect(dev ? 'http://localhost:3000/login' : 'https://app1.async-await.com/login');
    return;
  }

  const { path } = req.query;
  if (!path) {
    res.status(401).end('Bad request');
    return;
  }

  const teamSlug = path.split('/')[0];
  if (!teamSlug) {
    res.status(401).end('Bad request');
    return;
  }

  const team = await Team.findOne({ slug: teamSlug })
    .select('memberIds')
    .lean();

  if (!team || !team.memberIds.includes(req.user.id)) {
    res.status(401).end('Bad request');
    // TODO: show more informative error
    return;
  }

  const data: any = await signRequestForLoad(req.query.path);

  res.redirect(data.signedRequest);
});

server.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
});

server.get('*', (req, res) => {
  res.sendStatus(403);
});

server.listen(port, err => {
  if (err) throw err;
  logger.info(`> Ready on ${ROOT_URL}`);
});
