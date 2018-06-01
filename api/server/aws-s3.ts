import * as aws from 'aws-sdk';
import * as fs from 'fs';

export function signRequestForUpload(fileName, fileType, prefix) {
  aws.config.update({
    region: 'us-west-1',
    accessKeyId: process.env.Amazon_accessKeyId,
    secretAccessKey: process.env.Amazon_secretAccessKey,
  });

  const s3 = new aws.S3({ apiVersion: 'latest' });
  const bucket = 'async-posts'; // TODO: move to .env
  const teamPrefix = prefix;
  const randomStringForPrefix =
    Math.random()
      .toString(36)
      .substring(2, 12) +
    Math.random()
      .toString(36)
      .substring(2, 12);

  console.log(fileName);
  console.log(fileType);
  const key = `${teamPrefix}/${randomStringForPrefix}/${fileName}`;

  const params = {
    Bucket: bucket,
    Key: key,
    // Expires: 60,
    ContentType: fileType,
    ACL: 'private',
  };

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  // About Key: https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html

  // TODO: rewrite
  return new Promise((resolve, reject) => {
    // > You must ensure that you have static or previously resolved credentials
    // > if you call this method synchronously (with no callback), otherwise it may not properly sign the request
    s3.getSignedUrl('putObject', params, (err, data) => {
      const returnData = {
        signedRequest: data,
        path: key,
      };

      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(returnData);
        // console.log(returnData);
        return returnData;
      }
    });
  });
}

export function signRequestForLoad(path) {
  aws.config.update({
    region: 'us-west-1',
    accessKeyId: process.env.Amazon_accessKeyId,
    secretAccessKey: process.env.Amazon_secretAccessKey,
  });

  const s3 = new aws.S3({ apiVersion: 'latest' });
  const bucket = 'async-posts'; // TODO: move to .env
  // const destination = fileUrl
  //   .split('.com/')
  //   .pop()
  //   .split('?')
  //   .shift();
  // console.log(`destination:${destination}`);
  // console.log(`fileUrl:${fileUrl}`);

  const params = {
    Bucket: bucket,
    Key: path,
    Expires: 60,
  };

  // TODO: rewrite
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, (err, data) => {
      const returnData = {
        signedRequest: data,
      };

      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(returnData);
        // console.log(returnData);
        return returnData;
      }
    });
  });
}
