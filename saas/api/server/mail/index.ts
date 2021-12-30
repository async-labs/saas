import sendEmailViaSes from './ses';
import sendEmailViaSmtp from './smtp';
import sendEmailViaLog from './log';

export default function sendEmail(options) {
  switch (process.env.MAIL_DRIVER) {
    case 'smtp':
      sendEmailViaSmtp(options);
      break;
    case 'ses':
      sendEmailViaSes(options);
      break;
    case 'log':
      sendEmailViaLog(options);
      break;
    default:
      throw new Error(`Unknown mail driver: ${process.env.MAIL_DRIVER}`);
  }
}
