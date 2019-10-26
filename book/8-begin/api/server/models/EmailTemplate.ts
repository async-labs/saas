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

async function insertTemplates() {
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to SaaS by Async',
      message: `<%= userName %>,
        <p>
          Thanks for signing up on our <a href="https://github.com/async-labs/saas" target="blank">SaaS boilerplate</a>!
         <br/>
          Note that any data you save on the demo app will be deleted after 30 days.
        </p>
        <p>
          We used our SaaS boilerplate to build
          <a href="https://async-await.com" target="blank"> Async</a>,
           a communication and project management tool for small teams of software engineers.
        <br/>
          <a href="https://app.async-await.com/signup" target="blank">Sign up</a>
          at Async to check it out.
        </p>
        <p>
          If you're learning how to build your own SaaS web application, check out our
          <a href="https://builderbook.org/book" target="blank"> book</a>.
        </p>
        <p>
        If you want to hire us to customize or build features on top of our SaaS boilerplate, please fill out our
        <a href="https://forms.gle/vaLHem6Ccmp3hics6" target="blank">form</a>.
        </p>
        Kelly & Timur, Team Async
      `,
    },

    // 9
    // {
    //   name: 'login',
    //   subject: 'Login link for saas-app.async-await.com',
    //   message: `
    //     <p>Log into your account by clicking on this link: <a href="<%= loginURL %>"><%= loginURL %></a>.</p>`,
    // },

    // 10
    // {
    //   name: 'invitation',
    //   subject: 'You are invited to join a Team at async-await.com',
    //   message: `You've been invited to join <b><%= teamName%></b>.
    //     <br/>Click here to accept the invitation: <%= invitationURL%>
    //   `,
    // },

    // 14
    // {
    //   name: 'newPost',
    //   subject: 'New Post was created in Discussion: <%= discussionName %>',
    //   message: `<p>New Post in Discussion: "<%= discussionName%>" by <%= authorName%></p>
    //     New Post: "<%= postContent %>"
    //     <p>---</p>
    //     <p>View it at <a href="<%= discussionLink %>"><%= discussionLink %></a>.</p>
    //   `,
    // },
  ];

  for (const t of templates) {
    const et = await EmailTemplate.findOne({ name: t.name });
    const message = t.message
      .replace(/\n/g, '')
      .replace(/[ ]+/g, ' ')
      .trim();

    if (!et) {
      EmailTemplate.create(Object.assign({}, t, { message }));
    } else if (et.subject !== t.subject || et.message !== message) {
      EmailTemplate.updateOne({ _id: et._id }, { $set: { message, subject: t.subject } }).exec();
    }
  }
}

insertTemplates();

export default async function getEmailTemplate(
  name: string,
  // eslint-disable-next-line
  params: any,
  template?: EmailTemplateDocument,
) {
  const source =
    template ||
    (await EmailTemplate.findOne({ name }).setOptions({
      lean: true,
    }));

  if (!source) {
    throw new Error('Email Template is not found.');
  }

  return {
    message: _.template(source.message)(params),
    subject: _.template(source.subject)(params),
  };
}

export { EmailTemplate, EmailTemplateDocument };
