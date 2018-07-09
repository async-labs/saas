import * as mongoose from 'mongoose';
import Handlebars from 'handlebars';

interface IEmailTemplateDocument extends mongoose.Document {
  name: string;
  subject: string;
  message: string;
}

const EmailTemplate = mongoose.model<IEmailTemplateDocument>(
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
      message: `{{userName}},
        <p>
          Thanks for signing up on the demo app for our <a href="https://github.com/async-labs/saas" target="blank">SaaS boilerplate</a>!
        <br/>
          Note that any data you save on the demo app will be deleted after 30 days.
        </p>
        <p>
          If you're learning how to build your own web app, check out our <a href="https://builderbook.org/book" target="blank">book</a>. 
        <br/> 
          If you want to hire our team to build custom SaaS features, please fill out our <a href="https://goo.gl/forms/fnt6CkOOsaSUilIC3" target="blank">form</a>
        </p>
        <p>
          <a href="https://youtu.be/QiLXx-0W8Q4?t=1m7s" target="blank">We hope you don't like pain</a>.
        </p>
      
        Kelly & Timur, Team Async
      `,
    },
    {
      name: 'invitation',
      subject: 'You are invited to join a Team at async-await.com',
      message: `You've been invited to join <b>{{teamName}}</b>.
        <br/>Click here to accept the invitation: {{invitationURL}}
      `,
    },
  ];

  for (const t of templates) {
    if ((await EmailTemplate.find({ name: t.name }).count()) === 0) {
      EmailTemplate.create(
        Object.assign({}, t, { message: t.message.replace(/\n/g, '').replace(/[ ]+/g, ' ') }),
      );
    }
  }
}

insertTemplates();

export default async function getEmailTemplate(name, params) {
  const source = await EmailTemplate.findOne({ name });
  if (!source) {
    throw new Error('not found');
  }

  return {
    message: Handlebars.compile(source.message)(params),
    subject: Handlebars.compile(source.subject)(params),
  };
}
