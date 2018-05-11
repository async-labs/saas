import * as express from 'express';
import * as path from 'path';
import * as next from 'next';
import * as helmet from 'helmet';

import { getUser } from '../lib/api/public';
import routesWithSlug from './routesWithSlug';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const ROOT_URL = dev ? `http://localhost:${port}` : 'https://app1.async-await.com';

const URL_MAP = {
  '/terms': '/public/terms',
};

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

  server.get('/robots.txt', (_, res) => {
    res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
  });

  // middleware that populates req.user via fetching from API
  server.use(async (req: any, _, nextfn) => {
    const headers: any = {};
    if (req.headers && req.headers.cookie) {
      headers.cookie = req.headers.cookie;
    }

    const { user } = await getUser({ headers });
    req.user = user;

    nextfn();
  });

  routesWithSlug({ server, app });

  server.get('*', (req, res) => {
    const url = URL_MAP[req.path];
    if (url) {
      app.render(req, res, url);
    } else {
      handle(req, res);
    }
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on ${ROOT_URL}`);
  });
});
