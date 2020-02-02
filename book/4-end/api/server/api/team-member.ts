import * as express from 'express';

import { signRequestForUpload } from '../aws-s3';
import User from '../models/User';

const router = express.Router();

// Upload file to S3
router.post('/aws/get-signed-request-for-upload-to-s3', async (req, res, next) => {
  try {
    const { fileName, fileType, prefix, bucket, acl } = req.body;

    const returnData = await signRequestForUpload({
      fileName,
      fileType,
      prefix,
      bucket,
      acl,
    });

    res.json(returnData);
  } catch (err) {
    next(err);
  }
});

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

router.post('/user/toggle-theme', async (req, res, next) => {
  const { darkTheme, userId } = req.body;

  try {
    await User.toggleTheme({ userId: userId, darkTheme });

    res.json({ done: 1 });
  } catch (err) {
    next(err);
  }
});

export default router;
