import * as express from 'express';

import logger from '../logs';

import publicApi from './public';

// 10
// import teamLeaderApi from './team-leader';

import teamMemberApi from './team-member';

function handleError(err, _, res, __) {
  logger.error(err.stack);

  res.json({ error: err.message || err.toString() });
}

export default function api(server: express.Express) {
  server.use('/api/v1/public', publicApi, handleError);
  // 10
  // server.use('/api/v1/team-leader', teamLeaderApi, handleError);
  server.use('/api/v1/team-member', teamMemberApi, handleError);
}
