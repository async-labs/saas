import * as _ from 'lodash';
import * as mongoose from 'mongoose';

import sendEmail from './api/server/aws-ses';
import getEmailTemplate from './api/server/models/EmailTemplate';
import User from './api/server/models/User';


export const sendEmailForNewPost = async (event) => {
  console.log('Received event (request representation):', JSON.stringify(event));

  const reqBody = JSON.parse(event.body)

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

  console.log(
    discussionName,
    discussionLink,
    postContent,
    authorName,
    userIds,
  );

  await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useFindAndModify: false });

  try {
    const emailTemplate = await getEmailTemplate('newPost',     {
      discussionName,
      discussionLink,
      postContent,
      authorName,
    },);
  
    if (!emailTemplate) {
      throw new Error('newPost Email template not found');
    }
  
    const users = await User.find()
      .select('email')
      .setOptions({ lean: true });
  
    const usersToNotify = users.filter((user) => userIds.includes(user._id.toString()));
  
    console.log('usersToNotify', usersToNotify);
  
    const jobs = _.flatten(
      usersToNotify
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
        }),
    );
  
    await Promise.all(jobs);
  } catch (error) {
    console.error(error.stack);
    return { error: error.message, event };
  } finally {
    await mongoose.disconnect();
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Email notification was sent!',
      input: event,
    }),
  };

  return response;
};
