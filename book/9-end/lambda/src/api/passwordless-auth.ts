import * as passwordless from 'passwordless';

import sendEmail from './aws-ses';
import logger from './logs';
import getEmailTemplate from './models/EmailTemplate';
import Invitation from './models/Invitation';
import User from './models/User';
import PasswordlessMongoStore from './passwordless';

import { EMAIL_SUPPORT_FROM_ADDRESS, URL_APP } from './consts';

function setupPasswordless({ server, ROOT_URL }) {
  const mongoStore = new PasswordlessMongoStore();
  passwordless.init(mongoStore);

  passwordless.addDelivery(async (tokenToSend, uidToSend, recipient, callback) => {
    try {
      const template = await getEmailTemplate('login', {
        loginURL: `${ROOT_URL}/auth/logged_in?token=${tokenToSend}&uid=${encodeURIComponent(
          uidToSend,
        )}`,
      });

      logger.debug(template.message);

      await sendEmail({
        from: `Kelly from saas-app.builderbook.org <${EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [recipient],
        subject: template.subject,
        body: template.message,
      });

      callback();
    } catch (err) {
      logger.error('Email sending error:', err);
      callback(err);
    }
  });

  server.use(passwordless.sessionSupport());

  server.use((req, __, next) => {
    if (req.user && typeof req.user === 'string') {
      User.findById(req.user, User.publicFields(), (err, user) => {
        req.user = user;
        next(err);
      });
    } else {
      next();
    }
  });

  server.get(
    '/auth/logged_in',
    passwordless.acceptToken(),
    (req, __, next) => {
      if (req.user && typeof req.user === 'string') {
        User.findById(req.user, User.publicFields(), (err, user) => {
          req.user = user;
          next(err);
        });
      } else {
        next();
      }
    },
    (req, res) => {
      if (req.user && req.session.invitationToken) {
        Invitation.addUserToTeam({
          token: req.session.invitationToken,
          user: req.user,
        }).catch((err) => logger.error(err));

        req.session.invitationToken = null;
      }

      let redirectUrlAfterLogin;

      if (req.user && req.session.next_url) {
        redirectUrlAfterLogin = req.session.next_url;
      } else {
        if (!req.user || !req.user.defaultTeamSlug) {
          redirectUrlAfterLogin = '/create-team';
        } else {
          redirectUrlAfterLogin = `/team/${req.user.defaultTeamSlug}/discussions`;
        }
      }

      res.redirect(`${URL_APP}${redirectUrlAfterLogin}`);
    },
  );

  server.post(
    '/auth/send-token',
    passwordless.requestToken(
      async (email, __, callback) => {
        try {
          const user = await User.findOne({ email })
            .select('_id')
            .setOptions({ lean: true });

          if (user) {
            callback(null, user._id);
          } else {
            const id = await mongoStore.storeOrUpdateByEmail(email);
            callback(null, id);
          }
        } catch (error) {
          callback(error);
        }
      },
      { userField: 'email' },
    ),
    (req, res) => {
      if (req.query && req.query.next && req.query.next.startsWith('/')) {
        req.session.next_url = req.query.next;
      } else {
        req.session.next_url = null;
      }

      if (req.query && req.query.invitationToken) {
        req.session.invitationToken = req.query.invitationToken;
      } else {
        req.session.invitationToken = null;
      }

      res.json({ done: 1 });
    },
  );

  server.get('/logout', passwordless.logout(), (req, res) => {
    req.logout();
    res.redirect(`${URL_APP}/login`);
  });
}

export { setupPasswordless };
