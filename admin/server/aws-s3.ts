import * as aws from 'aws-sdk';

function deleteFiles(bucket: string, files: string[]) {
  aws.config.update({
    region: 'us-west-1',
    accessKeyId: process.env.Amazon_accessKeyId,
    secretAccessKey: process.env.Amazon_secretAccessKey,
  });

  const s3 = new aws.S3({ apiVersion: 'latest' });

  const params = {
    Bucket: bucket,
    Delete: {
      Objects: files.map(f => ({ Key: f })),
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

export { deleteFiles };
