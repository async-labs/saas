import * as express from 'express';

const router = express.Router();

router.get('/get-user', (req, res) => {
  return res.json({ user: req.user || null });
});

export default router;
