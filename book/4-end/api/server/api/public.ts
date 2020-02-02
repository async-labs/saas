import * as express from 'express';

const router = express.Router();

router.get('/get-user', (_, res) => {
  console.log('API server got request from APP server');
  res.json({ user: { email: 'team@builderbook.org' } });
});

export default router;
