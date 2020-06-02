import * as express from 'express';

import publicExpressRoutes from './public';
import teamMemberExpressRoutes from './team-member';
import teamLeaderApi from './team-leader';

function handleError(err, _, res, __) {
  console.error(err.stack);

  res.json({ error: err.message || err.toString() });
}

export default function api(server: express.Express) {
  server.use('/api/v1/public', publicExpressRoutes, handleError);
  server.use('/api/v1/team-member', teamMemberExpressRoutes, handleError);
  server.use('/api/v1/team-leader', teamLeaderApi, handleError);
}
