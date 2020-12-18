import * as passport from 'passport';
import { Strategy } from '@enterprise-oss/passport-osso';

import User, { UserDocument } from './models/User';
import Invitation from './models/Invitation';

const dev = process.env.NODE_ENV !== 'production';

function setupOsso({ server }) {
  if (!process.env.OSSO_CLIENT_ID) {
    return;
  }

  const verify = async (_accessToken, _refreshToken, _expiresIn, profile, done) => {
    try {
      const user = await User.signInOrSignUpViaOsso({
        ossoId: profile.id,
        email: profile.email,
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
        baseUrl: process.env.OSSO_BASE_URL,
        clientID: process.env.OSSO_CLIENT_ID,
        clientSecret: process.env.OSSO_CLIENT_SECRET,
        callbackURL: `${
          dev ? process.env.URL_API : process.env.PRODUCTION_URL_API
        }/auth/osso/callback`,
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

  server.get('/auth/osso', passport.authenticate('osso'));

  server.get(
    '/auth/osso/callback',
    passport.authenticate('osso', {
      failureRedirect: '/login',
    }),
    (req, res) => {
      if (req.user && req.session.invitationToken) {
        Invitation.addUserToTeam({
          token: req.session.invitationToken,
          user: req.user,
        }).catch((err) => console.error(err));

        req.session.invitationToken = null;
      }

      let redirectUrlAfterLogin;

      if (req.user && !req.user.defaultTeamSlug) {
        redirectUrlAfterLogin = '/create-team';
      } else {
        redirectUrlAfterLogin = `/team/${req.user.defaultTeamSlug}/discussions`;
      }

      res.redirect(
        `${dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP}${redirectUrlAfterLogin}`,
      );
    },
  );
}

export { setupOsso };
