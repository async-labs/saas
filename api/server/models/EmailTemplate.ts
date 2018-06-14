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
      subject: 'Welcome to Async',
      message: `{{userName}},
        <p>
          Thanks for signing up for Async!
        </p>
        <p>
          We built Async for engineering teams to have meaningful communication and achieve deep work.
        </p>
        <p>
          If you're building a SaaS product, check out our open source <a href="https://github.com/async-labs/saas-by-async" target="blank">SaaS boilerplate</a>.
        </p>
      
        Kelly & Timur, Team Async
      `,
    },
    {
      name: 'invitation',
      subject: 'Async: Team Invitation',
      message: `You've been invited to join {{teamName}}.
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
