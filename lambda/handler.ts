import * as mongoose from 'mongoose';

import { sendEmailNotification } from './src/sendEmailForNewPost';

export const sendEmailForNewPost = async event => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  if (
    event.discussionName === undefined ||
    event.postContent === undefined ||
    event.authorName === undefined ||
    event.userIds === undefined
  ) {
    return { message: 'Some data is missing from body of POST request', event };
  }

  console.log(event.discussionName, event.postContent, event.authorName, event.userIds);

  const dev = process.env.NODE_ENV !== 'production';

  const MONGO_URL = dev ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;

  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useFindAndModify: false });

  const { discussionName, postContent, authorName, userIds } = event;

  try {
    await sendEmailNotification({
      productionUrlApp: process.env.PRODUCTION_URL_APP,
      discussionName,
      postContent,
      authorName,
      userIds,
    });
  } catch (error) {
    console.error(error.stack);

    return { error: error.message, event };
  } finally {
    await mongoose.disconnect();
  }

  return { message: 'Email was sent successfully!', event };

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'Go Serverless v1.0! Your function executed successfully!',
  //     input: event,
  //   }),
  // };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
};

// set up and test API Gateway
