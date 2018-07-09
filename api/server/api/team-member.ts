import * as express from 'express';

import { signRequestForUpload } from '../aws-s3';
import Team from '../models/Team';
import User from '../models/User';
import Discussion from '../models/Discussion';
import Post from '../models/Post';
import logger from '../logs';
import Invitation from '../models/Invitation';

const router = express.Router();

router.use((req, res, next) => {
  console.log('team member API', req.path);
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

async function loadDiscussionsData(team, userId, body) {
  const { discussionSlug } = body;

  const { discussions } = await Discussion.getList({
    userId,
    teamId: team._id,
  });

  const data: any = { initialDiscussions: discussions };

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
  const initialMembers = await User.getTeamMembers({
    userId,
    teamId: team._id,
  });

  let initialInvitations = [];
  if (userId === team.teamLeaderId) {
    initialInvitations = await Invitation.getTeamInvitedUsers({
      userId,
      teamId: team._id,
    });
  }

  Object.assign(team, await loadDiscussionsData(team, userId, body));

  const data: any = { initialMembers, initialInvitations };

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

router.post('/discussions/add', async (req, res) => {
  try {
    const { name, teamId, memberIds = [] } = req.body;

    const discussion = await Discussion.add({
      userId: req.user.id,
      name,
      teamId,
      memberIds,
    });

    res.json({ discussion });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/discussions/edit', async (req, res) => {
  try {
    const { name, id, memberIds = [] } = req.body;

    await Discussion.edit({
      userId: req.user.id,
      name,
      id,
      memberIds,
    });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/discussions/delete', async (req, res) => {
  try {
    const { id } = req.body;

    await Discussion.delete({ userId: req.user.id, id });

    res.json({ done: 1 });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.get('/discussions/list', async (req, res) => {
  try {
    const { teamId } = req.query;

    const { discussions } = await Discussion.getList({
      userId: req.user.id,
      teamId,
    });

    console.log(`Express route: ${discussions.length}`);

    res.json({ discussions });
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
router.get('/aws/get-signed-request-for-upload-to-s3', async (req, res) => {
  try {
    const { fileName, fileType, prefix, bucket, acl = 'private' } = req.query;

    const returnData = await signRequestForUpload({
      fileName,
      fileType,
      prefix,
      bucket,
      user: req.user,
      acl,
    });

    res.json(returnData);
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/user/update-profile', async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;

    const updatedUser = await User.updateProfile({
      userId: req.user.id,
      name,
      avatarUrl,
    });

    res.json({ updatedUser });
  } catch (err) {
    logger.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

export default router;
