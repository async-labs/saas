import * as mongoose from 'mongoose';

import sendEmail from './api/server/aws-ses';
import getEmailTemplate from './api/server/models/EmailTemplate';
import User from './api/server/models/User';

export const sendEmailForNewPost = async (event) => {
  console.log('Received event (request representation):', JSON.stringify(event));

  const reqBody = JSON.parse(event.body);

  const { discussionName, discussionLink, postContent, authorName, userIds } = reqBody;

  if (
    discussionName === undefined ||
    discussionLink === undefined ||
    postContent === undefined ||
    authorName === undefined ||
    userIds === undefined
  ) {
    throw new Error('Missing data');
  }

  console.log(discussionName, discussionLink, postContent, authorName, userIds);

  await mongoose.connect(process.env.MONGO_URL);

  try {
    const emailTemplate = await getEmailTemplate('newPost', {
      discussionName,
      discussionLink,
      postContent,
      authorName,
    });

    if (!emailTemplate) {
      throw new Error('newPost Email template not found');
    }

    const usersToNotify = await User.find({ _id: { $in: userIds } })
      .select('email')
      .setOptions({ lean: true });

    console.log('usersToNotify', usersToNotify);

    const jobs = usersToNotify
      .filter((user) => !!user.email)
      .map(async (user) => {
        try {
          await sendEmail({
            from: `From async-await.com <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
            to: [user.email],
            subject: emailTemplate.subject,
            body: emailTemplate.message,
          });
          console.log('email is sent');
        } catch (err) {
          console.error(err.stack);
        }
      });

    await Promise.all(jobs);
  } catch (error) {
    console.error(error.stack);
    return { error: error.message, event };
  } finally {
    await mongoose.disconnect();
  }

  // const dev = process.env.NODE_ENV !== 'production';

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: 'Email notification was sent!',
      input: event,
    }),
  };

  return response;
};
