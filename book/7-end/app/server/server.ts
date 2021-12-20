import express from 'express';
import next from 'next';

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV !== 'production';

const app = next({ dev: IS_DEV });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // give all Nextjs's request to Nextjs before anything else
  server.get('/_next/*', (req, res) => {
    // console.log('next server, page');
    handle(req, res);
  });

  server.use(express.json());

  server.get('/', async (req: any, res) => {
    let redirectUrl = 'login';

    if (req.user) {
      if (!req.user.defaultTeamSlug) {
        redirectUrl = 'create-team';
      } else {
        redirectUrl = `team/${req.user.defaultTeamSlug}/your-settings`;
      }
    }

    res.redirect(`${process.env.URL_APP}/${redirectUrl}`);
  });

  // server.get('/api/v1/public/get-user', (_, res) => {
  //   res.json({ user: { email: 'team@builderbook.org' } });
  // });

  server.get('/team/:teamSlug/team-settings', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/team-settings', { teamSlug });
  });

  server.all('*', (req, res) => {
    handle(req, res);
  });

  server.listen(process.env.PORT_APP, () => {
    console.log(`> Ready on ${process.env.URL_APP}`);
  });
});
