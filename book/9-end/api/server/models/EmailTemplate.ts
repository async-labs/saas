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
      subject: 'Welcome to SaaS boilerplate by Async',
      message: `Welcome <%= userName %>,
        <p>
          Thanks for signing up on our <a href="https://github.com/async-labs/saas" target="blank">SaaS boilerplate</a>!
        </p>
        <p>
          If you are learning how to build a SaaS web app, check out our 2 books:
           <a href="https://builderbook.org" target="blank">Builder Book</a>
           and
           <a href="https://builderbook.org/book" target="blank">SaaS Boilerplate</a>.
        </p>
        <p>
          Also check out
          <a href="https://async-await.com" target="blank"> Async</a>
          , our communication tool for small teams of software developers.
        </p>
        Kelly & Timur, Team Async
      `,
    },
    {
      name: 'login',
      subject: 'Login link for saas-app.builderbook.org',
      message: `
        <p>Log into your account by clicking on this link: <a href="<%= loginURL %>"><%= loginURL %></a>.</p>`,
    },
    {
      name: 'invitation',
      subject: 'You are invited to join a Team at saas-app.builderbook.org',
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
    const et = await EmailTemplate.findOne({ name: t.name }).lean();
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

  const et = await EmailTemplate.findOne({ name }).lean();

  if (!et) {
    throw new Error('Email Template is not found in database.');
  }

  return {
    message: _.template(et.message)(params),
    subject: _.template(et.subject)(params),
  };
}
