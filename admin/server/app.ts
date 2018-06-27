import * as express from 'express';
import * as session from 'express-session';
import * as path from 'path';
import * as next from 'next';
import * as helmet from 'helmet';
import * as mobxReact from 'mobx-react';
import * as compression from 'compression';
import * as mongoSessionStore from 'connect-mongo';
import * as mongoose from 'mongoose';
import auth from './google';
import api from './api';

// import routesWithSlug from './routesWithSlug';

// import { getUser } from '../lib/api/admin';

require('dotenv').config();

mobxReact.useStaticRendering(true);

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 9000;
const ROOT_URL = dev ? `http://localhost:${port}` : process.env.PRODUCTION_URL_ADMIN;

let MONGO_URL = dev ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;
mongoose.connect(MONGO_URL);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // give all Nextjs's request to Nextjs before anything else
  server.get('/_next/*', (req, res) => {
    handle(req, res);
  });

  server.get('/static/*', (req, res) => {
    handle(req, res);
  });

  server.use(helmet());
  server.use(compression());
  server.use(express.json());

  const MongoStore = mongoSessionStore(session);
  const sessionOptions = {
    name: 'admin-async-await.sid',
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
    sessionOptions.cookie.secure = true; // sets cookie over HTTPS only
  }

  const sessionMiddleware = session(sessionOptions);
  server.use(sessionMiddleware);

  auth({ server, ROOT_URL });
  api(server);

  server.get('/', async (req: any, res) => {
    let redirectUrl = 'login';

    if (req.user && req.user.isAdmin) {
      redirectUrl = 'settings/admin';
    }

    res.redirect(`${ROOT_URL}/${redirectUrl}`);
  });

  server.get('/robots.txt', (_, res) => {
    res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
  });

  // middleware that populates req.user via fetching from API
  // server.use(async (req: any, _, nextfn) => {
  //   const headers: any = {};
  //   if (req.headers && req.headers.cookie) {
  //     headers.cookie = req.headers.cookie;
  //   }

  //   try {
  //     const { user } = await getUser({ headers });
  //     req.user = user;
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   nextfn();
  // });

  // routesWithSlug({ server, app });

  server.get('*', (req, res) => {
    handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on ${ROOT_URL}`);
  });
});
