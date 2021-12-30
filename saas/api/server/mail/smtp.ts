import * as nodemailer from 'nodemailer';

export default function sendEmail(options) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.body,
        html: options.body,
      },
      (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      },
    );
  });
}