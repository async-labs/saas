import * as compression from 'compression';
import * as mongoSessionStore from 'connect-mongo';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as session from 'express-session';
import * as helmet from 'helmet';
import * as httpModule from 'http';
import * as mongoose from 'mongoose';
import * as path from 'path';

import api from './api';
import { setupGoogle, setupPasswordless } from './auth';
import { signRequestForLoad } from './aws-s3';
import { setup as realtime } from './realtime';
import { stripeWebHooks } from './stripe';

import logger from './logs';
import Team from './models/Team';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 8000;
const { PRODUCTION_URL_APP, PRODUCTION_URL_API } = process.env;
const ROOT_URL = dev ? `http://localhost:${port}` : PRODUCTION_URL_API;

const MONGO_URL = dev ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

mongoose.connect(MONGO_URL, options);

const server = express();

const appPort = process.env.APP_PORT || 3000;
const origin = dev ? `http://localhost:${appPort}` : PRODUCTION_URL_APP;
server.use(cors({ origin, credentials: true }));

server.use(helmet());
server.use(compression());

stripeWebHooks({ server });

server.use(express.json());

const MongoStore = mongoSessionStore(session);
const sessionOptions = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 14 * 24 * 60 * 60, // save session 14 days
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
    domain: dev ? 'localhost' : '.async-await.com',
  } as any,
};

if (!dev) {
  server.set('trust proxy', 1); // sets req.hostname, req.ip
  sessionOptions.cookie.secure = true; // sets cookie over HTTPS only
}

const sessionMiddleware = session(sessionOptions);
server.use(sessionMiddleware);

setupGoogle({ server, ROOT_URL });
setupPasswordless({ server, ROOT_URL, MONGO_URL });

api(server);

const http = new httpModule.Server(server);
realtime({ http, origin: dev ? 'http://localhost:3000' : PRODUCTION_URL_APP, sessionMiddleware });

server.get('/uploaded-file', async (req, res) => {
  if (!req.user) {
    res.redirect(dev ? 'http://localhost:3000/login' : `${PRODUCTION_URL_APP};/login`);
    return;
  }

  const { path: filePath, bucket, teamSlug } = req.query;

  if (!filePath) {
    res.status(401).end('Missing required data');
    return;
  }

  if (!bucket) {
    res.status(401).end('Missing required data');
    return;
  }

  if (teamSlug) {
    const team = await Team.findOne({ slug: teamSlug })
      .select('memberIds')
      .setOptions({ lean: true });

    if (!team || !team.memberIds.includes(req.user.id)) {
      res.status(401).end('You do not have permission.');
      return;
    }
  }

  const data: any = await signRequestForLoad(filePath, bucket);

  res.redirect(data.signedRequest);
});

server.get('/robots.txt', (_, res) => {
  res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
});

server.get('*', (_, res) => {
  res.sendStatus(403);
});

http.listen(port, () => {
  logger.info(`> Ready on ${ROOT_URL}`);
});
