import * as express from 'express';
import * as path from 'path';
import * as next from 'next';
import * as helmet from 'helmet';
import * as mobxReact from 'mobx-react';

import { getUser } from '../lib/api/public';
import routesWithSlug from './routesWithSlug';
import env from '../lib/env';

mobxReact.useStaticRendering(true);

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const { PRODUCTION_URL_APP } = env;
const ROOT_URL = dev ? `http://localhost:${port}` : PRODUCTION_URL_APP;

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
  server.use(express.json());

  if (!dev) {
    server.set('trust proxy', 1); // sets req.hostname, req.ip
  }

  // middleware that populates req.user via fetching from API
  server.use(async (req: any, _, nextfn) => {
    const headers: any = {};
    if (req.headers && req.headers.cookie) {
      headers.cookie = req.headers.cookie;
    }

    try {
      const { user } = await getUser({ headers });
      req.user = user;
    } catch (error) {
      console.log(error);
    }

    nextfn();
  });

  server.get('/', async (req: any, res) => {
    let redirectUrl = 'login';

    if (req.user) {
      if (!req.user.defaultTeamSlug) {
        redirectUrl = 'settings/create-team';
      } else {
        redirectUrl = `team/${req.user.defaultTeamSlug}/d`;
      }
    }

    res.redirect(`${ROOT_URL}/${redirectUrl}`);
  });

  server.get('/robots.txt', (_, res) => {
    res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
  });

  routesWithSlug({ server, app });

  server.get('*', (req, res) => {
    handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on ${ROOT_URL}`);
  });
});
