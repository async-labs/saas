import * as express from 'express';

import { signRequestForUpload } from '../aws-s3';

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

export default router;
