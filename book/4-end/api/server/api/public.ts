import * as express from 'express';

import User from '../models/User';

// import logger from '../logs';

const router = express.Router();

// router.get('/get-user', (req, res) => {
//   res.json({ user: req.user || null });
// });

router.post('/user/update-profile', async (req, res, next) => {
  try {
    const { name, avatarUrl, userId } = req.body;

    // get userId properly, from req.body

    const updatedUser = await User.updateProfile({
      userId: userId,
      name,
      avatarUrl,
    });

    res.json({ updatedUser });
  } catch (err) {
    next(err);
  }
});

export default router;
