import * as express from 'express';

import logger from '../logs';

const router = express.Router();

router.get('/get-user', (_, res) => {
  logger.info('API server got request from APP server');
  res.json({ user: { email: 'team@builderbook.org' } });
});

export default router;
