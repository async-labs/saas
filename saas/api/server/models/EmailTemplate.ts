import * as _ from 'lodash';
import * as mongoose from 'mongoose';

interface EmailTemplateDocument extends mongoose.Document {
  name: string;
  subject: string;
  message: string;
}

const EmailTemplate = mongoose.model<EmailTemplateDocument>(
  'EmailTemplate',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  }),
);

export async function insertTemplates() {
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to SaaS boilerplate (demo)',
      message: `Welcome <%= userName %>,
        <p>
          Thanks for signing up on our demo!
        </p>
        <p>
          If you are learning how to code and/or build a SaaS web application, check out our two books:
           <a href="https://builderbook.org" target="blank">Builder Book</a>
           and
           <a href="https://builderbook.org/book" target="blank">SaaS Boilerplate</a>.
        </p>
        <p>
          Also check out our other projects built with SaaS boilerplate:
          <a href="https://async-await.com" target="blank"> Async</a>, 
          <a href="https://async-labs.com" target="blank"> Async Labs</a>, and
          <a href="https://workinbiotech.com" target="blank"> Work in biotech</a>.
        </p>
        Kelly & Timur, Team Async Labs
      `,
    },
    {
      name: 'login',
      subject: 'Login link for saas-app.async-await.com',
      message: `
        <p>Log into your account by clicking on this link: <a href="<%= loginURL %>"><%= loginURL %></a>.</p>`,
    },
    {
      name: 'invitation',
      subject: 'You are invited to join a team at saas-app.async-await.com',
      message: `You've been invited to join <b><%= teamName%></b>.
        <br/>Click here to accept the invitation: <%= invitationURL%>
      `,
    },
    {
      name: 'newPost',
      subject: 'New Post was created in Discussion: <%= discussionName %>',
      message: `<p>New Post in Discussion: "<%= discussionName%>" by <%= authorName%></p>
        New Post: "<%= postContent %>"
        <p>---</p>
        <p>View it at <a href="<%= discussionLink %>"><%= discussionLink %></a>.</p>
      `,
    },
  ];

  for (const t of templates) {
    const et = await EmailTemplate.findOne({ name: t.name }).setOptions({ lean: true });
    const message = t.message.replace(/\n/g, '').replace(/[ ]+/g, ' ').trim();

    if (!et) {
      EmailTemplate.create(Object.assign({}, t, { message }));
    } else if (et.subject !== t.subject || et.message !== message) {
      EmailTemplate.updateOne({ _id: et._id }, { $set: { message, subject: t.subject } }).exec();
    }
  }
}

export default async function getEmailTemplate(name: string, params: any) {
  await insertTemplates();

  const et = await EmailTemplate.findOne({ name }).setOptions({ lean: true });

  if (!et) {
    throw new Error('Email Template is not found in database.');
  }

  return {
    message: _.template(et.message)(params),
    subject: _.template(et.subject)(params),
  };
}
