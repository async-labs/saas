import * as passport from 'passport';
import { OAuth2Strategy as Strategy } from 'passport-google-oauth';
import * as passwordless from 'passwordless';
import * as PasswordlessMongoStore from 'passwordless-mongostore-bcrypt-node';

import logger from './logs';
import Invitation from './models/Invitation';
import User, { IUserDocument } from './models/User';

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_APP } = process.env;
const URL_APP = dev ? 'http://localhost:3000' : PRODUCTION_URL_APP;

function setupPasswordless({ server, ROOT_URL, MONGO_URL }) {
  passwordless.init(new PasswordlessMongoStore(MONGO_URL));
  passwordless.addDelivery((tokenToSend, uidToSend, recipient, callback, req) => {
    const text = `Hello!\nAccess your account here:
    http://${ROOT_URL}/logged_in?$token=${tokenToSend}&uid=${encodeURIComponent(uidToSend)}`;

    logger.debug(text, recipient, req.body);
    callback(null);
  });

  server.use(passwordless.sessionSupport());
  server.use(passwordless.acceptToken({ successRedirect: '/' }));

  server.get('/logged_in', passwordless.acceptToken(), (__, res) => {
    res.redirect('/');
  });

  server.post(
    '/sendtoken',
    passwordless.requestToken(
      (user, __, callback, req) => {
        logger.debug(req.body);

        User.find({ email: user }, ret => {
          if (ret) {
            callback(null, ret.id);
          } else {
            callback(null, null);
          }
        });
      },
      (__, res) => {
        res.json({ done: 1 });
      },
    ),
  );
}

function setupGoogle({ ROOT_URL, server }) {
  const clientID = process.env.Google_clientID;
  const clientSecret = process.env.Google_clientSecret;

  const verify = async (accessToken, refreshToken, profile, verified) => {
    let email;
    let avatarUrl;

    if (profile.emails) {
      email = profile.emails[0].value;
    }

    if (profile.photos && profile.photos.length > 0) {
      avatarUrl = profile.photos[0].value.replace('sz=50', 'sz=128');
    }

    try {
      const user = await User.signInOrSignUp({
        googleId: profile.id,
        email,
        googleToken: { accessToken, refreshToken },
        displayName: profile.displayName,
        avatarUrl,
      });

      verified(null, user);
    } catch (err) {
      verified(err);
      logger.error(err); // eslint-disable-line
    }
  };

  passport.use(
    new Strategy(
      {
        clientID,
        clientSecret,
        callbackURL: `${ROOT_URL}/oauth2callback`,
      },
      verify,
    ),
  );

  passport.serializeUser((user: IUserDocument, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, User.publicFields(), (err, user) => {
      done(err, user);
    });
  });

  server.use(passport.initialize());
  server.use(passport.session());

  server.get('/auth/google', (req, res, next) => {
    const options = {
      scope: ['profile', 'email'],
      prompt: 'select_account',
    };

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

    passport.authenticate('google', options)(req, res, next);
  });

  server.get(
    '/oauth2callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      if (req.user && req.session.invitationToken) {
        Invitation.addUserToTeam({ token: req.session.invitationToken, user: req.user }).catch(
          err => logger.error(err),
        );
      }

      let redirectUrlAfterLogin;

      if (req.user && req.session.next_url) {
        redirectUrlAfterLogin = req.session.next_url;
      } else {
        if (!req.user.defaultTeamSlug) {
          redirectUrlAfterLogin = '/create-team';
        } else {
          redirectUrlAfterLogin = `/team/${req.user.defaultTeamSlug}/discussions`;
        }
      }

      res.redirect(`${URL_APP}${redirectUrlAfterLogin}`);
    },
  );

  server.get('/logout', (req, res) => {
    req.logout();
    res.redirect(`${URL_APP}/login`);
  });
}

export { setupPasswordless, setupGoogle };
