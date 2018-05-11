import * as express from 'express';

import Team from '../models/Team';
import Topic from '../models/Topic';
import logger from '../logs';
import Discussion from '../models/Discussion';
import Message from '../models/Message';
import Notification from '../models/Notification';

const router = express.Router();

router.use((req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.getList(req.user.id);

    res.json({ teams });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/topics/list', async (req, res) => {
  try {
    const topics = await Topic.getList({ userId: req.user.id, teamId: req.query.teamId });

    res.json({ topics });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/discussions/add', async (req, res) => {
  try {
    const { name, topicId, memberIds } = req.body;

    const discussion = await Discussion.add({ userId: req.user.id, name, topicId, memberIds });

    res.json({ discussion });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/discussions/edit', async (req, res) => {
  try {
    const { name, id, memberIds } = req.body;

    await Discussion.edit({ userId: req.user.id, name, id, memberIds });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/discussions/delete', async (req, res) => {
  try {
    const { discussionId } = req.body;

    await Discussion.delete({ userId: req.user.id, id: discussionId });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/discussions/toggle-pin', async (req, res) => {
  try {
    const { id, isPinned } = req.body;

    await Discussion.togglePin({ userId: req.user.id, id, isPinned });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/discussions/list', async (req, res) => {
  try {
    const {
      topicId,
      searchQuery = '',
      skip,
      limit,
      pinnedDiscussionCount,
      initialDiscussionSlug = '',
      isInitialDiscussionLoaded = false,
    } = req.query;

    const { discussions, totalCount } = await Discussion.getList({
      userId: req.user.id,
      topicId,
      searchQuery,
      skip: Number(skip) || 0,
      limit: Number(limit) || 10,
      pinnedDiscussionCount: Number(pinnedDiscussionCount) || 0,
      initialDiscussionSlug,
      isInitialDiscussionLoaded,
    });

    res.json({ discussions, totalCount });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/messages/add', async (req, res) => {
  try {
    const { content, discussionId } = req.body;

    const message = await Message.add({ userId: req.user.id, content, discussionId });

    res.json({ message });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/messages/edit', async (req, res) => {
  try {
    const { content, id } = req.body;

    await Message.edit({ userId: req.user.id, content, id });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/messages/delete', async (req, res) => {
  try {
    const { id } = req.body;

    await Message.delete({ userId: req.user.id, id });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/messages/list', async (req, res) => {
  try {
    const messages = await Message.getList({
      userId: req.user.id,
      discussionId: req.query.discussionId,
    });

    res.json({ messages });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/notifications/list', async (req, res) => {
  try {
    const notifications = await Notification.getList({
      userId: req.user.id,
    });

    res.json({ notifications });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

router.post('/notifications/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    await Notification.bulkDelete({ userId: req.user.id, ids });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.message || err.toString() });
  }
});

export default router;
