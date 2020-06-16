import * as express from 'express';

import Invitation from '../models/Invitation';
import Team from '../models/Team';
import User from '../models/User';

const router = express.Router();

router.use((req, res, next) => {
  console.log('team leader API', req.path);

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

router.post('/teams/add', async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;

    console.log(`Express route: ${name}, ${avatarUrl}`);

    const team = await Team.addTeam({ userId: req.user._id, name, avatarUrl });

    res.json(team);
  } catch (err) {
    next(err);
  }
});

router.post('/teams/update', async (req, res, next) => {
  try {
    const { teamId, name, avatarUrl } = req.body;

    const team = await Team.updateTeam({
      userId: req.user._id,
      teamId,
      name,
      avatarUrl,
    });

    res.json(team);
  } catch (err) {
    next(err);
  }
});

router.get('/teams/get-invited-users', async (req, res, next) => {
  try {
    const users = await Invitation.getTeamInvitedUsers({
      userId: req.user._id,
      teamId: req.query.teamId,
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.post('/teams/invite-member', async (req, res, next) => {
  try {
    const { teamId, email } = req.body;

    const newInvitation = await Invitation.add({ userId: req.user._id, teamId, email });

    res.json({ newInvitation });
  } catch (err) {
    next(err);
  }
});

router.post('/teams/remove-member', async (req, res, next) => {
  try {
    const { teamId, userId } = req.body;

    await Team.removeMember({ teamLeaderId: req.user._id, teamId, userId });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

export default router;
