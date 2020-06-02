import * as express from 'express';

import User from '../models/User';
import Invitation from '../models/Invitation';

const router = express.Router();

router.get('/get-user', (req, res) => {
  console.log(req.user);
  res.json({ user: req.user || null });
});

router.post('/get-user-by-slug', async (req, res, next) => {
  console.log('Express route: /get-user-by-slug');

  // req.session.foo = 'bar';

  try {
    const { slug } = req.body;

    const user = await User.getUserBySlug({ slug });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/user/update-profile', async (req, res, next) => {
  console.log('Express route: /user/update-profile');

  try {
    const { name, avatarUrl } = req.body;

    const userId = '5e6427a51c9d440000c9ba6f';

    const updatedUser = await User.updateProfile({
      userId: userId,
      name,
      avatarUrl,
    });

    res.json({ updatedUser });
  } catch (err) {
    next(err);
  }
});

router.get('/invitations/accept-and-get-team-by-token', async (req: any, res, next) => {
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

router.post('/invitations/remove-invitation-if-member-added', async (req: any, res, next) => {
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
