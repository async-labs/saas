import * as express from 'express';

import logger from '../logs';

import publicApi from './public';
import teamMemberApi from './team-member';

function handleError(err, _, res, __) {
  logger.error(err.stack);

  res.json({ error: err.message || err.toString() });
}

export default function api(server: express.Express) {
  server.use('/api/v1/public', publicApi, handleError);
  server.use('/api/v1/team-member', teamMemberApi, handleError);
}

// introduce logger ?
