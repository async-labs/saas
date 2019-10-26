import './env';

import * as compression from 'compression';
import * as mongoSessionStore from 'connect-mongo';
import * as cors from 'cors';
import * as express from 'express';
import * as session from 'express-session';
import * as helmet from 'helmet';
// 13
// import * as httpModule from 'http';
import * as mongoose from 'mongoose';
import * as path from 'path';

import api from './api';

import { setupGoogle } from './auth';

// 9
// import { setupGoogle, setupPasswordless } from './auth';

import { signRequestForLoad } from './aws-s3';
// 13
// import { setup as realtime } from './realtime';

// 11
// import { stripeWebHooks } from './stripe';

import logger from './logs';

// 10
// import Team from './models/Team';

import {
  COOKIE_DOMAIN,
  IS_DEV,
  MONGO_URL,
  PORT_API as PORT,
  SESSION_NAME,
  SESSION_SECRET,
  URL_API as ROOT_URL,
  URL_APP,
} from './consts';

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

mongoose.connect(MONGO_URL, options);

const server = express();

server.use(cors({ origin: URL_APP, credentials: true }));

server.use(helmet());
server.use(compression());

// 11
// stripeWebHooks({ server });

server.use(express.json());

const MongoStore = mongoSessionStore(session);
const sessionOptions = {
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 14 * 24 * 60 * 60, // save session 14 days
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
    domain: COOKIE_DOMAIN,
    // eslint-disable-next-line

  } as any,
};

if (!IS_DEV) {
  server.set('trust proxy', 1); // sets req.hostname, req.ip
  sessionOptions.cookie.secure = true; // sets cookie over HTTPS only
}

const sessionMiddleware = session(sessionOptions);
server.use(sessionMiddleware);

setupGoogle({ server, ROOT_URL });

// 9
// setupPasswordless({ server, ROOT_URL });

api(server);

// 13
// const http = new httpModule.Server(server);
// realtime({ http, origin: URL_APP, sessionMiddleware });

server.get('/uploaded-file', async (req, res) => {
  if (!req.user) {
    res.redirect(`${URL_APP}/login`);
    return;
  }

  const { path: filePath, bucket } = req.query;

  // 10
  // const { path: filePath, bucket, teamSlug } = req.query;

  if (!filePath) {
    res.status(401).end('Missing required data');
    return;
  }

  if (!bucket) {
    res.status(401).end('Missing required data');
    return;
  }

  // 10
  // if (teamSlug) {
  //   const team = await Team.findOne({ slug: teamSlug })
  //     .select('memberIds')
  //     .setOptions({ lean: true });

  //   if (!team || !team.memberIds.includes(req.user.id)) {
  //     res.status(401).end('You do not have permission.');
  //     return;
  //   }
  // }

  // eslint-disable-next-line
  const data: any = await signRequestForLoad(filePath, bucket);

  res.redirect(data.signedRequest);
});

server.get('/robots.txt', (_, res) => {
  res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
});

server.get('*', (_, res) => {
  res.sendStatus(403);
});

// 13
// http.listen(PORT, () => {
//   logger.info(`> Ready on ${ROOT_URL}`);
// });

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  logger.info(`> Ready on ${ROOT_URL}`);
});
