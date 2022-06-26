import express from 'express';
import next from 'next';

import setupSitemapAndRobots from './setupSitemapAndRobots';

import routesWithCache from './routesWithCache';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // give all Nextjs's request to next server before anything else
  server.get('/_next/*', (req, res) => {
    // console.log('next server, page');
    handle(req, res);
  });

  server.use(express.json());

  if (!dev) {
    server.set('trust proxy', 1); // sets req.hostname, req.ip
  }

  server.get('/', async (req: any, res) => {
    let redirectUrl = 'login';

    if (req.user) {
      if (!req.user.defaultTeamSlug) {
        redirectUrl = 'create-team';
      } else {
        redirectUrl = `team/${req.user.defaultTeamSlug}/discussions`;
      }
    }

    res.redirect(
      `${
        dev ? process.env.NEXT_PUBLIC_URL_APP : process.env.NEXT_PUBLIC_PRODUCTION_URL_APP
      }/${redirectUrl}`,
    );
  });

  // server.get('/api/v1/public/get-user', (_, res) => {
  //   res.json({ user: { email: 'team@builderbook.org' } });
  // });

  server.get('/teams/:teamSlug/your-settings', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/your-settings', { teamSlug });
  });

  server.get('/teams/:teamSlug/team-settings', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/team-settings', { teamSlug });
  });

  server.get('/teams/:teamSlug/billing', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/billing', { teamSlug, ...(req.query || {}) });
  });

  server.get('/teams/:teamSlug/discussions/:discussionSlug', (req, res) => {
    const { teamSlug, discussionSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug, discussionSlug });
  });

  server.get('/teams/:teamSlug/discussions', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug });
  });

  server.get('/teams/:teamSlug/discussions-f/:discussionSlug', (req, res) => {
    const { teamSlug, discussionSlug } = req.params;
    app.render(req, res, '/discussion-f', { teamSlug, discussionSlug });
  });

  server.get('/teams/:teamSlug/discussions-f', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/discussion-f', { teamSlug });
  });

  server.get('/signup', (req, res) => {
    app.render(req, res, '/login');
  });

  server.get('/invitation', (req, res) => {
    app.render(req, res, '/invitation', { token: req.query.token as string });
  });

  setupSitemapAndRobots({ server });

  routesWithCache({ server, app });

  server.get('*', (req, res) => {
    handle(req, res);
  });

  // listen(handle: any, listeningListener?: () => void): http.Server;
  // "@types/express-serve-static-core", "version": "4.17.1"
  server.listen(port, () => {
    console.log(
      `> Ready on ${
        dev ? process.env.NEXT_PUBLIC_URL_APP : process.env.NEXT_PUBLIC_PRODUCTION_URL_APP
      }`,
    );
  });
});
