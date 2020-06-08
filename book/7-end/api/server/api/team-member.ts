import * as express from 'express';

import { signRequestForUpload } from '../aws-s3';

import User from '../models/User';
import Team from '../models/Team';
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

    console.log(returnData);

    res.json(returnData);
  } catch (err) {
    next(err);
  }
});

router.post('/user/update-profile', async (req, res, next) => {
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

router.post('/user/toggle-theme', async (req, res, next) => {
  try {
    const { darkTheme } = req.body;

    await User.toggleTheme({ userId: req.user.id, darkTheme });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

async function loadTeamData(team, userId) {
  const initialMembers = await User.getMembersForTeam({
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

  const data: any = { initialMembers, initialInvitations };

  return data;
}

router.post('/get-initial-data', async (req, res, next) => {
  try {
    const teams = await Team.getAllTeamsForUser(req.user.id);

    let selectedTeamSlug = req.body.teamSlug;
    if (!selectedTeamSlug && teams && teams.length > 0) {
      selectedTeamSlug = teams[0].slug;
    }

    for (const team of teams) {
      if (team.slug === selectedTeamSlug) {
        Object.assign(team, await loadTeamData(team, req.user.id));
        break;
      }
    }

    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

router.get('/teams', async (req, res, next) => {
  try {
    const teams = await Team.getAllTeamsForUser(req.user.id);

    res.json({ teams });
  } catch (err) {
    next(err);
  }
});

export default router;
