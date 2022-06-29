import * as express from 'express';

import { signRequestForUpload } from '../aws-s3';

import User from '../models/User';
import Team from '../models/Team';
import Invitation from '../models/Invitation';
import Discussion from '../models/Discussion';
import Post from '../models/Post';

import {
  discussionAdded,
  discussionDeleted,
  discussionEdited,
  postAdded,
  postDeleted,
  postEdited,
} from '../sockets';

const router = express.Router();

router.use((req, res, next) => {
  console.log('team member API', req.path);
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

// Get signed request from AWS S3 server
router.post('/aws/get-signed-request-for-upload-to-s3', async (req, res, next) => {
  try {
    const { fileName, fileType, prefix, bucket } = req.body;

    const returnData = await signRequestForUpload({
      fileName,
      fileType,
      prefix,
      bucket,
    });

    console.log(bucket);

    res.json(returnData);
  } catch (err) {
    next(err);
  }
});

router.post('/user/update-profile', async (req: any, res, next) => {
  try {
    const { name, avatarUrl } = req.body;

    const updatedUser = await User.updateProfile({
      userId: req.user.id,
      name,
      avatarUrl,
    });

    res.json({ updatedUser });
  } catch (err) {
    next(err);
  }
});

router.post('/user/toggle-theme', async (req: any, res, next) => {
  try {
    const { darkTheme } = req.body;

    await User.toggleTheme({ userId: req.user.id, darkTheme });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

async function loadDiscussionsData(team, userId, body) {
  const { discussionSlug } = body;

  if (!discussionSlug) {
    return [];
  }

  const { discussions } = await Discussion.getList({
    userId,
    teamId: team._id,
  });

  for (const discussion of discussions) {
    if (discussion.slug === discussionSlug) {
      Object.assign(discussion, {
        initialPosts: await Post.getList({
          userId,
          discussionId: discussion._id,
        }),
      });

      break;
    }
  }

  return discussions;
}

async function loadTeamData(team, userId, body) {
  const initialMembers = await User.getMembersForTeam({
    userId,
    teamId: team._id,
  });

  let initialInvitations = [];
  if (userId === team.teamLeaderId) {
    initialInvitations = await Invitation.getTeamInvitations({
      userId,
      teamId: team._id,
    });
  }

  console.log(`initialMembers:${initialMembers}`);

  const initialDiscussions = await loadDiscussionsData(team, userId, body);

  const data: any = { initialMembers, initialInvitations, initialDiscussions };

  // console.log(`Express route:${data.initialPosts}`);

  return data;
}

router.post('/get-initial-data', async (req: any, res, next) => {
  try {
    const teams = await Team.getAllTeamsForUser(req.user.id);

    let selectedTeamSlug = req.body.teamSlug;
    if (!selectedTeamSlug && teams && teams.length > 0) {
      selectedTeamSlug = teams[0].slug;
    }

    for (const team of teams) {
      if (team.slug === selectedTeamSlug) {
        Object.assign(team, await loadTeamData(team, req.user.id, req.body));
        break;
      }
    }

    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

router.get('/teams', async (req: any, res, next) => {
  try {
    const teams = await Team.getAllTeamsForUser(req.user.id);

    console.log(teams);

    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

router.get('/teams/get-members', async (req: any, res, next) => {
  try {
    const users = await User.getMembersForTeam({
      userId: req.user.id,
      teamId: req.query.teamId as string,
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.post('/discussions/add', async (req: any, res, next) => {
  try {
    const { name, teamId, memberIds = [], socketId } = req.body;

    const discussion = await Discussion.add({
      userId: req.user.id,
      name,
      teamId,
      memberIds,
    });

    discussionAdded({ socketId, discussion });

    res.json({ discussion });
  } catch (err) {
    next(err);
  }
});

router.post('/discussions/edit', async (req: any, res, next) => {
  try {
    const { name, id, memberIds = [], socketId } = req.body;

    const updatedDiscussion = await Discussion.edit({
      userId: req.user.id,
      name,
      id,
      memberIds,
    });

    discussionEdited({ socketId, discussion: updatedDiscussion });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

router.post('/discussions/delete', async (req: any, res, next) => {
  try {
    const { id, socketId } = req.body;

    const { teamId } = await Discussion.delete({ userId: req.user.id, id });

    discussionDeleted({ socketId, teamId, id });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

router.get('/discussions/list', async (req: any, res, next) => {
  try {
    const { discussions } = await Discussion.getList({
      userId: req.user.id,
      teamId: req.query.teamId as string,
    });

    res.json({ discussions });
  } catch (err) {
    next(err);
  }
});

router.get('/posts/list', async (req: any, res, next) => {
  try {
    const posts = await Post.getList({
      userId: req.user.id,
      discussionId: req.query.discussionId as string,
    });

    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/add', async (req: any, res, next) => {
  try {
    const { content, discussionId, socketId } = req.body;

    const post = await Post.add({ userId: req.user.id, content, discussionId });

    postAdded({ socketId, post });

    res.json({ post });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/edit', async (req: any, res, next) => {
  try {
    const { content, id, socketId } = req.body;

    const updatedPost = await Post.edit({ userId: req.user.id, content, id });

    postEdited({ socketId, post: updatedPost });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/delete', async (req: any, res, next) => {
  try {
    const { id, discussionId, socketId } = req.body;

    await Post.delete({ userId: req.user.id, id });

    postDeleted({ socketId, id, discussionId });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

export default router;
