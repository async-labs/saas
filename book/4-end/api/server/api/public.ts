import * as express from 'express';

import User from '../models/User';

const router = express.Router();

// router.get('/get-user', (req, res) => {
//   res.json({ user: { email: 'team@builderbook.org' } });
// });

router.post('/get-user-by-slug', async (req, res, next) => {
  console.log('Express route: /get-user-by-slug');

  try {
    const { slug } = req.body;

    const user = await User.getUserBySlug({ slug });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/user/update-profile', async (req, res, next) => {
  console.log('Express route: /user/update-profile');

  try {
    const { name, avatarUrl } = req.body;

    const userId = '5e6427a51c9d440000c9ba6f';

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
