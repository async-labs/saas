import * as express from 'express';

import Invitation from '../models/Invitation';

const router = express.Router();

router.get('/get-user', (req, res) => {
  res.json({ user: req.user || null });
});

router.get('/invitations/accept-and-get-team-by-token', async (req, res, next) => {
  try {
    const team = await Invitation.getTeamByToken({
      token: req.query.token,
    });

   if (req.user) {
     await Invitation.addUserToTeam({ token: req.query.token, user: req.user });
   }

    res.json({ team });
  } catch (err) {
    next(err);
  }
});

router.post('/invitations/remove-invitation-if-member-added', async (req, res, next) => {
  try {
    const team = await Invitation.removeIfMemberAdded({
      token: req.body.token,
      userId: req.user.id,
    });

    res.json({ team });
  } catch (err) {
    next(err);
  }
});

export default router;
