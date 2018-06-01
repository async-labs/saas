import * as express from 'express';

import Invitation from '../models/Invitation';
import logger from '../logs';

const router = express.Router();

router.get('/get-user', (req, res) => {
  res.json({ user: req.user || null });
});

router.get('/invitations/get-team-by-token', async (req, res) => {
  try {
    const team = await Invitation.getTeamByToken({
      token: req.query.token,
    });

    res.json({ team });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

export default router;
