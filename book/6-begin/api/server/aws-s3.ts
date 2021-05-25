import * as url from 'url';
import * as aws from 'aws-sdk';

async function signRequestForUpload({ fileName, fileType, prefix, bucket }) {
  const randomStringForPrefix =
    Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

  const key = `${prefix}/${randomStringForPrefix}/${fileName}`;

  const acl = 'public-read';

  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 60,
    ContentType: fileType,
    ACL: acl,
  };

  console.log(prefix);

  const s3 = new aws.S3({
    apiVersion: 'latest',
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  });

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (err, data) => {
      const parsedUrl = url.parse(data);

      const returnData = {
        signedRequest: data,
        url: `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}`,
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
