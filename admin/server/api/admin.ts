import * as express from 'express';
import Team from '../models/Team';

const router = express.Router();

router.use((req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

router.get('/teams/remove-old-data', async (req, res) => {
  try {
    console.log(req.user._id);
    
    const allTeams = await Team.find({}).lean();
    const arrayOfTeamIds = allTeams._id;

    const removedTeams = await Team.removeOldData({ arrayOfTeamIds });

    res.json({ removedTeams });
  } catch (err) {
    console.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

router.post('/get-initial-data', async (req, res) => {
  try {
    const teams = await Team.getList(req.user.id);

    res.json({ teams });
  } catch (err) {
    console.error(err);
    res.json({ error: err.post || err.toString() });
  }
});

export default router;
