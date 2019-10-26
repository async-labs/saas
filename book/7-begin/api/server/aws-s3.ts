import * as aws from 'aws-sdk';
import logger from './logs';

// 10
// import Team from './models/Team';

import { AMAZON_ACCESSKEYID, AMAZON_SECRETACCESSKEY } from './consts';

async function checkPrefix(prefix, user) {
  // Prefix must be either user slug or user's team slug
  if (prefix === user.slug) {
    return;
  }

  // 10
  // const teams = await Team.find({ memberIds: user.id })
  //   .select('slug')
  //   .setOptions({ lean: true });

  // if (!teams.find(t => t.slug === prefix)) {
  //   throw new Error('Wrong prefix.');
  // }
}

async function signRequestForUpload({ fileName, fileType, prefix, bucket, user, acl = 'private' }) {
  await checkPrefix(prefix, user);

  aws.config.update({
    region: 'us-west-1',
    accessKeyId: AMAZON_ACCESSKEYID,
    secretAccessKey: AMAZON_SECRETACCESSKEY,
  });

  const s3 = new aws.S3({ apiVersion: 'latest' });
  const randomStringForPrefix =
    Math.random()
      .toString(36)
      .substring(2, 12) +
    Math.random()
      .toString(36)
      .substring(2, 12);

  const key = `${prefix}/${randomStringForPrefix}/${fileName}`;

  // eslint-disable-next-line
  const params: any = {
    Bucket: bucket,
    Key: key,
    Expires: 60,
    ContentType: fileType,
    ACL: acl,
  };

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  // About Key: https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html

  // > You must ensure that you have static or previously resolved credentials
  // > if you call this method synchronously (with no callback), otherwise it may not properly sign the request
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (err, data) => {
      const returnData = {
        signedRequest: data,
        path: key,
        url: `https://${bucket}.s3.amazonaws.com/${key}`,
      };

      if (err) {
        logger.error(err);
        reject(err);
      } else {
        resolve(returnData);
      }
    });
  });
}

function signRequestForLoad(path, bucket) {
  aws.config.update({
    region: 'us-west-1',
    accessKeyId: AMAZON_ACCESSKEYID,
    secretAccessKey: AMAZON_SECRETACCESSKEY,
  });

  const s3 = new aws.S3({ apiVersion: 'latest' });

  const params = {
    Bucket: bucket,
    Key: path,
    Expires: 60,
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, data) => {
      const returnData = {
        signedRequest: data,
      };

      if (err) {
        logger.error(err);
        reject(err);
      } else {
        resolve(returnData);
      }
    });
  });
}

function deleteFiles(bucket: string, files: string[]) {
  aws.config.update({
    region: 'us-west-1',
    accessKeyId: AMAZON_ACCESSKEYID,
    secretAccessKey: AMAZON_SECRETACCESSKEY,
  });

  const s3 = new aws.S3({ apiVersion: 'latest' });

  const params = {
    Bucket: bucket,
    Delete: {
      Objects: files.map((f) => ({ Key: f })),
    },
  };

  return new Promise((resolve, reject) => {
    s3.deleteObjects(params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

export { signRequestForUpload, signRequestForLoad, deleteFiles };
