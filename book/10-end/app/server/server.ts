import express from 'express';
import next from 'next';

import routesWithCache from './routesWithCache';

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // give all Nextjs's request to Nextjs before anything else
  server.get('/_next/*', (req, res) => {
    // console.log('next server, page');
    handle(req, res);
  });

  server.use(express.json());

  // server.get('/api/v1/public/get-user', (_, res) => {
  //   res.json({ user: { email: 'team@builderbook.org' } });
  // });

  server.get('/team/:teamSlug/team-settings', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/team-settings', { teamSlug });
  });

  server.get('/team/:teamSlug/discussions/:discussionSlug', (req, res) => {
    const { teamSlug, discussionSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug, discussionSlug });
  });

  server.get('/team/:teamSlug/discussions', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug });
  });

  server.get('/team/:teamSlug/billing', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/billing', { teamSlug, ...(req.query || {}) });
  });

  server.get('/signup', (req, res) => {
    app.render(req, res, '/login');
  });

  routesWithCache({ server, app });

  server.all('*', (req, res) => {
    handle(req, res);
  });

  server.listen(process.env.PORT_APP, (err: Error) => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on ${process.env.URL_APP}`);
  });
});
