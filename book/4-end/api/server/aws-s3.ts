import * as aws from 'aws-sdk';

async function signRequestForUpload({ fileName, fileType, prefix, bucket }) {
  aws.config.update({
    region: 'us-west-1',
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  });

  const randomStringForPrefix =
    Math.random()
      .toString(36)
      .substring(2, 12) +
    Math.random()
      .toString(36)
      .substring(2, 12);

  const key = `${prefix}/${randomStringForPrefix}/${fileName}`;

  const acl = 'private';

  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 60,
    ContentType: fileType,
    ACL: acl,
  };

  console.log(prefix);

  const s3 = new aws.S3({ apiVersion: 'latest' });

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (err, data) => {
      const returnData = {
        signedRequest: data,
        url: `https://${bucket}.s3.amazonaws.com/${key}`,
      };

      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(returnData);
      }
    });
  });
}

export { signRequestForUpload };
