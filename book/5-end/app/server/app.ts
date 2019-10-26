import './env';

import express from 'express';
import helmet from 'helmet';
import * as mobxReact from 'mobx-react';
import next from 'next';
import * as path from 'path';

import { getUser } from '../lib/api/public';

// 10
// import routesWithSlug from './routesWithSlug';

import { IS_DEV, PORT_APP, URL_APP } from '../lib/consts';

mobxReact.useStaticRendering(true);

const app = next({ dev: IS_DEV });
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

  if (!IS_DEV) {
    server.set('trust proxy', 1); // sets req.hostname, req.ip
  }

  // middleware that populates req.user via fetching from API
  // eslint-disable-next-line
  server.use(async (req: any, _, nextfn) => {
    // eslint-disable-next-line
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

  // eslint-disable-next-line
  server.get('/', async (req: any, res) => {
    let redirectUrl = 'login';

    if (req.user) {
      if (!req.user.isAdmin) {
        redirectUrl = 'your-settings';
      }

      // 10
      // if (!req.user.isAdmin && !req.user.defaultTeamSlug) {
      //   redirectUrl = 'create-team';
      // }

      // 12
      // if (!req.user.isAdmin && !req.user.defaultTeamSlug) {
      //   redirectUrl = 'create-team';
      // } else {
      //   redirectUrl = `team/${req.user.defaultTeamSlug}/discussions`;
      // }
    }

    res.redirect(`${URL_APP}/${redirectUrl}`);
  });

  // 10
  // routesWithSlug({ server, app });

  // temporary in 6
  // server.get('/', async (req, res) => {
  //   const user = { email: 'team@async-await.com' };
  //   app.render(req, res, '/', user);
  // });

  server.get('/robots.txt', (_, res) => {
    res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
  });

  server.get('*', (req, res) => {
    handle(req, res);
  });

  server.listen(PORT_APP, err => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on ${URL_APP}`);
  });
});
