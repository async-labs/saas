import * as nodemailer from 'nodemailer';
import logger from '../logger';

export default function sendEmail(options) {
  const transporter = nodemailer.createTransport({
    jsonTransport: true,
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
          logger.debug(err);
          reject(err);
        } else {
          logger.info(info);
          resolve(info);
        }
      },
    );
  });
}