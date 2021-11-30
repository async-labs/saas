import * as express from 'express';

import Invitation from '../models/Invitation';
import Team from '../models/Team';
import User from '../models/User';
import { createSession } from '../stripe';

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

    const team = await Team.addTeam({ userId: req.user.id, name, avatarUrl });

    res.json(team);
  } catch (err) {
    next(err);
  }
});

router.post('/teams/update', async (req, res, next) => {
  try {
    const { teamId, name, avatarUrl } = req.body;

    // console.log(req.user.id, typeof req.user.id);
    // console.log(req.user._id, typeof req.user._id);

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

router.get('/teams/get-invitations-for-team', async (req, res, next) => {
  try {
    const users = await Invitation.getTeamInvitations({
      userId: req.user.id,
      teamId: req.query.teamId as string,
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

router.post('/stripe/fetch-checkout-session', async (req, res, next) => {
  try {
    const { mode, teamId } = req.body;

    const user = await User.findById(req.user.id).select(['stripeCustomer', 'email']).setOptions({ lean: true });

    const team = await Team.findById(teamId)
      .select(['stripeSubscription', 'slug', 'teamLeaderId'])
      .setOptions({ lean: true });

    if (!user || !team || team.teamLeaderId !== req.user.id) {
      throw new Error('Permission denied');
    }

    const session = await createSession({
      mode,
      userId: user._id.toString(),
      userEmail: user.email,
      teamId,
      teamSlug: team.slug,
      customerId: (user.stripeCustomer && user.stripeCustomer.id) || undefined,
      subscriptionId: (team.stripeSubscription && team.stripeSubscription.id) || undefined,
    });

    res.json({ sessionId: session.id });
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
