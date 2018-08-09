import * as express from 'express';

import logger from '../logs';
import Invitation from '../models/Invitation';
import Team from '../models/Team';
import User from '../models/User';

const router = express.Router();

// TODO: check for Team Leader properly

router.use((req, res, next) => {
  logger.debug('team leader API', req.path);

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

router.post('/teams/add', async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;

    logger.debug(`Express route: ${name}, ${avatarUrl}`);

    const team = await Team.add({ userId: req.user.id, name, avatarUrl });

    res.json(team);
  } catch (err) {
    next(err);
  }
});

router.post('/teams/update', async (req, res, next) => {
  try {
    const { teamId, name, avatarUrl } = req.body;

    const team = await Team.updateTeam({
      userId: req.user.id,
      teamId,
      name,
      avatarUrl,
    });

    res.json(team);
  } catch (err) {
    next(err);
  }
});

router.get('/teams/get-members', async (req, res, next) => {
  try {
    const users = await User.getTeamMembers({ userId: req.user.id, teamId: req.query.teamId });

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get('/teams/get-invited-users', async (req, res, next) => {
  try {
    const users = await Invitation.getTeamInvitedUsers({
      userId: req.user.id,
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

    const newInvitation = await Invitation.add({ userId: req.user.id, teamId, email });

    res.json({ newInvitation });
  } catch (err) {
    next(err);
  }
});

router.post('/teams/remove-member', async (req, res, next) => {
  try {
    const { teamId, userId } = req.body;

    await Team.removeMember({ teamLeaderId: req.user.id, teamId, userId });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

router.post('/create-customer', async (req, res, next) => {
  const { token } = req.body;

  try {
    const { hasCardInformation, stripeCard } = await User.createCustomer({
      userId: req.user.id,
      stripeToken: token,
    });

    res.json({ hasCardInformation, stripeCard });
  } catch (err) {
    next(err);
  }
});

router.post('/create-new-card-update-customer', async (req, res, next) => {
  const { token } = req.body;

  logger.debug('called express route');

  try {
    const { stripeCard } = await User.createNewCardUpdateCustomer({
      userId: req.user.id,
      stripeToken: token,
    });

    res.json({ stripeCard });
  } catch (err) {
    next(err);
  }
});

router.post('/subscribe-team', async (req, res, next) => {
  const { teamId } = req.body;

  try {
    const { isSubscriptionActive, stripeSubscription } = await Team.subscribeTeam({
      teamLeaderId: req.user.id,
      teamId,
    });

    res.json({ isSubscriptionActive, stripeSubscription });
  } catch (err) {
    next(err);
  }
});

router.post('/cancel-subscription', async (req, res, next) => {
  const { teamId } = req.body;

  try {
    const { isSubscriptionActive } = await Team.cancelSubscription({
      teamLeaderId: req.user.id,
      teamId,
    });

    res.json({ isSubscriptionActive });
  } catch (err) {
    next(err);
  }
});

router.get('/get-list-of-invoices-for-customer', async (req, res, next) => {
  try {
    const { stripeListOfInvoices } = await User.getListOfInvoicesForCustomer({
      userId: req.user.id,
    });
    res.json({ stripeListOfInvoices });
  } catch (err) {
    next(err);
  }
});

export default router;
