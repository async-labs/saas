import * as _ from 'lodash';

import sendEmail from './api/aws-ses';
import getEmailTemplate, { EmailTemplate } from './api/models/EmailTemplate';
import User from './api/models/User';

async function sendEmailNotification({
  productionUrlApp,
  discussionName,
  discussionLink,
  postContent,
  authorName,
  userIds,
}: {
  productionUrlApp: string;
  discussionName: string;
  discussionLink: string;
  postContent: string;
  authorName: string;
  userIds: string[];
}) {
  console.log(productionUrlApp, discussionName, discussionLink, postContent, authorName, userIds);

  const emailTemplate = await EmailTemplate.findOne({ name: 'newPost' }).setOptions({
    lean: true,
  });

  if (!emailTemplate) {
    throw new Error('newPost Email template not found');
  }

  const templateWithData = await getEmailTemplate(
    'newPost',
    {
      discussionName,
      discussionLink,
      postContent,
      authorName,
    },
    emailTemplate,
  );

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
            subject: templateWithData.subject,
            body: templateWithData.message,
          });
          console.log('email is sent');
        } catch (err) {
          console.error(err.stack);
        }
      }),
  );

  await Promise.all(jobs);
}

export { sendEmailNotification };
