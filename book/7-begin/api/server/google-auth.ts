import * as passport from 'passport';
import { OAuth2Strategy as Strategy } from 'passport-google-oauth';

import User, { UserDocument } from './models/User';

function setupGoogle({ server }) {
  if (!process.env.GOOGLE_CLIENTID) {
    return;
  }

  const verify = async (accessToken, refreshToken, profile, done) => {
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

      done(null, user);
    } catch (err) {
      done(err);
      console.error(err);
    }
  };

  passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_CLIENTSECRET,
        callbackURL: `${process.env.URL_API}/oauth2callback`,
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

    passport.authenticate('google', options)(req, res, next);

    console.log('/auth/google');
  });

  server.get(
    '/oauth2callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
    }),
    (_, res) => {
      console.log('/oauth2callback');
      res.redirect(`${process.env.URL_APP}/your-settings`);
    },
  );

  // server.get('/logout', (req, res) => {
  //   req.logout();
  //   res.redirect(`${process.env.URL_APP}/login`);
  // });
}

export { setupGoogle };
