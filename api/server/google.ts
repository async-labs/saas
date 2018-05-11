import * as passport from 'passport';
import { OAuth2Strategy as Strategy } from 'passport-google-oauth';

import User, { IUserDocument } from './models/User';

const dev = process.env.NODE_ENV !== 'production';

export default function auth({ ROOT_URL, server }) {
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
      console.log(err); // eslint-disable-line
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

    passport.authenticate('google', options)(req, res, next);
  });

  server.get(
    '/oauth2callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      // console.log(req.user);
      if (req.user && req.user.isAdmin) {
        res.redirect(dev ? 'http://localhost:3000/admin' : 'https://app1.async-await.com/admin');
      } else if (req.session.next_url) {
        res.redirect(dev
          ? `http://localhost:3000${req.session.next_url}`
          : `https://app1.async-await.com${req.session.next_url}`);
      } else {
        res.redirect(dev
          ? 'http://localhost:3000/'
          : 'https://app1.async-await.com/');
      }
    },
  );

  server.get('/logout', (req, res) => {
    req.logout();
    res.redirect(dev ? 'http://localhost:3000/login' : 'https://app1.async-await.com/login');
  });
}
