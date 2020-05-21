import express from 'express';
import * as mobxReact from 'mobx-react';
import next from 'next';

mobxReact.useStaticRendering(true);

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

  // server.get('/api/v1/public/get-user', (_, res) => {
  //   res.json({ user: { email: 'team@builderbook.org' } });
  // });

  server.all('*', (req, res) => {
    handle(req, res);
  });

  server.listen(process.env.PORT_APP, (err) => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on ${process.env.URL_APP}`);
  });
});

// import './env';

// import express from 'express';
// import next from 'next';

// import { getUser } from '../lib/api/public';

// const NODE_ENV = process.env.NODE_ENV || 'development';
// const IS_DEV = NODE_ENV !== 'production';

// const app = next({ dev: IS_DEV });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();

//   // give all Nextjs's request to Nextjs before anything else
//   server.get('/_next/*', (req, res) => {
//     handle(req, res);
//   });

//   server.use(express.json());

//   // middleware that populates req.user via fetching from API
//   server.use(async (req: any, _, nextfn) => {
//     const headers: any = {};
//     if (req.headers && req.headers.cookie) {
//       headers.cookie = req.headers.cookie;
//     }

//     try {
//       const { user } = await getUser({ headers });
//       req.user = user;
//     } catch (error) {
//       console.log(error);
//     }

//     nextfn();
//   });

// server.all('*', (req, res) => {
//   handle(req, res);
// });

//   server.listen(process.env.PORT_APP, (err) => {
//     if (err) {
//       throw err;
//     }
//     console.log(`> Ready on ${process.env.URL_APP}`);
//   });
// });
