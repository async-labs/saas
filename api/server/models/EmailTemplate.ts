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
      subject: 'Welcome to builderbook.org',
      message: `{{userName}},
        <p>
          Thank you for signing up for Builder Book!
        </p>
        <p>
          In our book, we teach you how to build a production-ready web app from scratch.
          Here is the introduction <a href="https://builderbook.org/books/builder-book/introduction" target="blank">chapter</a>.
        </p>
      
        Kelly & Timur, Team Builder Book
      `,
    },
    {
      name: 'invitation',
      subject: 'Async: team invitation',
      message: `You have invited to {{teamName}}
        <br/>Click here to accept: {{invitationURL}}
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
