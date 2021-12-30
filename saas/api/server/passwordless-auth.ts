import * as passwordless from 'passwordless';

import sendEmail from './mail';
import getEmailTemplate from './models/EmailTemplate';
import User from './models/User';
import PasswordlessMongoStore from './passwordless-token-mongostore';
import Invitation from './models/Invitation';

function setupPasswordless({ server }) {
  const mongoStore = new PasswordlessMongoStore();

  const dev = process.env.NODE_ENV !== 'production';

  passwordless.addDelivery(async (tokenToSend, uidToSend, recipient, callback) => {
    try {
      const template = await getEmailTemplate('login', {
        loginURL: `${
          dev ? process.env.URL_API : process.env.PRODUCTION_URL_API
        }/auth/logged_in?token=${tokenToSend}&uid=${encodeURIComponent(uidToSend)}`,
      });

      await sendEmail({
        from: `Kelly from saas-app.async-await.com <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [recipient],
        subject: template.subject,
        body: template.message,
      });

      callback();
    } catch (err) {
      console.error('Email sending error:', err);
      callback(err);
    }
  });

  passwordless.init(mongoStore);
  server.use(passwordless.sessionSupport());

  server.use((req, __, next) => {
    if (req.user && typeof req.user === 'string') {
      User.findById(req.user, User.publicFields()).exec((err, user) => {
        req.user = user;
        console.log('passwordless middleware');
        next(err);
      });
    } else {
      next();
    }
  });

  server.post(
    '/auth/email-login-link',
    passwordless.requestToken(async (email, __, callback) => {
      try {
        const user = await User.findOne({ email }).select('_id').setOptions({ lean: true });

        if (user) {
          callback(null, user._id);
        } else {
          const id = await mongoStore.storeOrUpdateByEmail(email);
          callback(null, id);
        }
      } catch (error) {
        callback(error, null);
      }
    }),
    (req, res) => {
      if (req.query && req.query.invitationToken) {
        req.session.invitationToken = req.query.invitationToken;
      } else {
        req.session.invitationToken = null;
      }

      res.json({ done: 1 });
    },
  );

  server.get(
    '/auth/logged_in',
    passwordless.acceptToken(),
    (req, __, next) => {
      if (req.user && typeof req.user === 'string') {
        User.findById(req.user, User.publicFields()).exec((err, user) => {
          req.user = user;
          next(err);
        });
      } else {
        next();
      }
    },
    async (req, res) => {
      let teamSlugOfInvitedTeam;

      if (req.user && req.session.invitationToken) {
        teamSlugOfInvitedTeam = await Invitation.addUserToTeam({
          token: req.session.invitationToken,
          user: req.user,
        }).catch((err) => console.error(err));

        req.session.invitationToken = null;
      }

      let redirectUrlAfterLogin;

      // console.log(req.user.defaultTeamSlug, teamSlugOfInvitedTeam);

      if (req.user && teamSlugOfInvitedTeam) {
        redirectUrlAfterLogin = `/teams/${teamSlugOfInvitedTeam}/discussions`;
      } else if (req.user && !teamSlugOfInvitedTeam && req.user.defaultTeamSlug) {
        redirectUrlAfterLogin = `/teams/${req.user.defaultTeamSlug}/discussions`;
      } else if (req.user && !teamSlugOfInvitedTeam && !req.user.defaultTeamSlug) {
        redirectUrlAfterLogin = `/create-team`;
      }

      res.redirect(
        `${dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP}${redirectUrlAfterLogin}`,
      );
    },
  );

  server.get('/logout', passwordless.logout(), (req, res) => {
    req.logout();

    if (req.query && req.query.invitationToken) {
      res.redirect(
        `${dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP}/invitation?token=${
          req.query.invitationToken
        }`,
      );
    } else {
      res.redirect(`${dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP}/login`);
    }
  });
}

export { setupPasswordless };
