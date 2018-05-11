import * as express from 'express';

import Invitation from '../models/Invitation';
import Team from '../models/Team';
import Topic from '../models/Topic';
import logger from '../logs';
import User from '../models/User';

const router = express.Router();

// check for Team Leader properly

router.use((req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

router.post('/teams/add', async (req, res) => {
  try {
    const { name } = req.body;

    await Team.add({ userId: req.user.id, name });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/teams/get-member-list', async (req, res) => {
  try {
    const users = await User.getTeamMemberList({ userId: req.user.id, teamId: req.query.teamId });

    res.json({ users });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/teams/invite-member', async (req, res) => {
  try {
    const { teamId, email } = req.body;

    await Invitation.add({ userId: req.user.id, teamId, email });

    res.json({ done: 1 });
  } catch (err) {
    console.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/teams/remove-member', async (req, res) => {
  try {
    const { teamId, userId } = req.body;

    await Team.removeMember({ teamLeaderId: req.user.id, teamId, userId });

    res.json({ done: 1 });
  } catch (err) {
    console.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/invitations/get-by-team-slug', async (req, res) => {
  try {
    const { teamName, invitationId } = await Invitation.getByTeamSlug({
      userId: req.user.id,
      userEmail: req.user.email,
      teamSlug: req.query.teamSlug,
    });

    res.json({ teamName, invitationId });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/invitations/accept-or-cancel', async (req, res) => {
  try {
    const { teamSlug, isAccepted } = req.body;

    await Invitation.acceptOrCancel({
      userId: req.user.id,
      userEmail: req.user.email,
      teamSlug,
      isAccepted,
    });

    res.json({ done: 1 });
  } catch (err) {
    console.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/topics/add', async (req, res) => {
  try {
    const { name, teamId, isPrivate = false, memberIds } = req.body;

    const topic = await Topic.add({ userId: req.user.id, name, teamId, isPrivate, memberIds });

    res.json({ topic });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/topics/edit', async (req, res) => {
  try {
    const { id, name, isPrivate = false, memberIds } = req.body;

    await Topic.edit({ userId: req.user.id, name, id, isPrivate, memberIds });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/topics/delete', async (req, res) => {
  try {
    const { topicId } = req.body;

    await Topic.delete({ userId: req.user.id, topicId });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

export default router;
