import * as express from 'express';

import { signRequestForUpload, signRequestForLoad } from '../aws-s3';
import Team from '../models/Team';
import Topic from '../models/Topic';
import User from '../models/User';
import Discussion from '../models/Discussion';
import Post from '../models/Post';
import logger from '../logs';

const router = express.Router();

router.use((req, res, next) => {
  console.log('team member API', req.path);
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

async function loadTopicData(topic, userId, body) {
  const { discussionSlug } = body;

  const { discussions, totalCount } = await Discussion.getList({
    userId,
    topicId: topic._id,
    initialDiscussionSlug: discussionSlug,
  });

  const data: any = { initialDiscussions: discussions, totalDiscussionCount: totalCount };

  for (let i = 0; i < discussions.length; i++) {
    const discussion = discussions[i];

    if (discussion.slug === discussionSlug) {
      Object.assign(discussion, {
        initialPosts: await Post.getList({
          userId: userId,
          discussionId: discussion._id,
        }),
      });

      break;
    }
  }

  if (discussionSlug) {
    data.currentDiscussionSlug = discussionSlug;
  }

  return data;
}

async function loadTeamData(team, userId, body) {
  const initialTopics = await Topic.getList({ userId, teamId: team._id });
  const initialMembers = await User.getTeamMemberList({
    userId,
    teamId: team._id,
  });

  const { topicSlug } = body;

  if (topicSlug) {
    for (let i = 0; i < initialTopics.length; i++) {
      const topic = initialTopics[i];

      if (topic.slug === topicSlug) {
        Object.assign(topic, await loadTopicData(topic, userId, body));
        break;
      }
    }
  }

  const data: any = { initialTopics, initialMembers };

  if (topicSlug) {
    data.currentTopicSlug = topicSlug;
  }

  return data;
}

router.post('/get-initial-data', async (req, res) => {
  try {
    const teams = await Team.getList(req.user.id);

    let selectedTeamSlug = req.body.teamSlug;
    if (!selectedTeamSlug && teams && teams.length > 0) {
      selectedTeamSlug = teams[0].slug;
    }

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];

      if (team.slug === selectedTeamSlug) {
        Object.assign(team, await loadTeamData(team, req.user.id, req.body));
        break;
      }
    }

    res.json({ teams });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.getList(req.user.id);

    res.json({ teams });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.get('/topics/list', async (req, res) => {
  try {
    const topics = await Topic.getList({ userId: req.user.id, teamId: req.query.teamId });

    res.json({ topics });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/discussions/add', async (req, res) => {
  try {
    const { name, topicId, memberIds = [], isPrivate = false } = req.body;

    const discussion = await Discussion.add({
      userId: req.user.id,
      name,
      topicId,
      memberIds,
      isPrivate,
    });

    res.json({ discussion });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/discussions/edit', async (req, res) => {
  try {
    const { name, id, memberIds = [], isPrivate = false } = req.body;

    await Discussion.edit({ userId: req.user.id, name, id, memberIds, isPrivate });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/discussions/delete', async (req, res) => {
  try {
    const { discussionId } = req.body;

    await Discussion.delete({ userId: req.user.id, id: discussionId });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/discussions/toggle-pin', async (req, res) => {
  try {
    const { id, isPinned } = req.body;

    await Discussion.togglePin({ userId: req.user.id, id, isPinned });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
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
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/posts/add', async (req, res) => {
  try {
    const { content, discussionId } = req.body;

    const post = await Post.add({ userId: req.user.id, content, discussionId });

    res.json({ post });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/posts/edit', async (req, res) => {
  try {
    const { content, id } = req.body;

    await Post.edit({ userId: req.user.id, content, id });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/posts/delete', async (req, res) => {
  try {
    const { id } = req.body;

    await Post.delete({ userId: req.user.id, id });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.get('/posts/list', async (req, res) => {
  try {
    const posts = await Post.getList({
      userId: req.user.id,
      discussionId: req.query.discussionId,
    });

    res.json({ posts });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

// Upload file to S3

router.get('/posts/get-signed-request-for-upload-to-s3', async (req, res) => {
  try {
    const { fileName, fileType, prefix } = req.query;
    // console.log(fileName, fileType);

    const returnData = await signRequestForUpload(fileName, fileType, prefix);
    // console.log(returnData);

    res.json(returnData);
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

export default router;
