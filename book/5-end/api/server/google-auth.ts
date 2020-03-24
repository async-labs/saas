import * as passport from 'passport';
import { OAuth2Strategy as Strategy } from 'passport-google-oauth';

import User, { UserDocument } from './models/User';

function setupGoogle({ ROOT_URL, server }) {
  if (!process.env.GOOGLE_CLIENTID) {
    return;
  }

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
      const user = await User.signInOrSignUpViaGoogle({
        googleId: profile.id,
        email,
        googleToken: { accessToken, refreshToken },
        displayName: profile.displayName,
        avatarUrl,
      });

      verified(null, user);
    } catch (err) {
      verified(err);
      console.error(err);
    }
  };

  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENTSECRET,
        callbackURL: `${ROOT_URL}/oauth2callback`,
      },
      verify,
    ),
  );

  passport.serializeUser((user: UserDocument, done) => {
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

    if (
      req.query &&
      req.query.redirectUrlAfterLogin &&
      req.query.redirectUrlAfterLogin.startsWith('/')
    ) {
      req.session.nextUrl = req.query.redirectUrlAfterLogin;
    } else {
      req.session.nextUrl = null;
    }

    passport.authenticate('google', options)(req, res, next);
  });

  server.get(
    '/oauth2callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      let redirectUrlAfterLogin;

      if (req.user && req.session.next_url) {
        redirectUrlAfterLogin = req.session.next_url;
      } else {
        redirectUrlAfterLogin = '/your-settings';
      }

      res.redirect(`${process.env.URL_APP}${redirectUrlAfterLogin}`);
    },
  );
}

export { setupGoogle };
