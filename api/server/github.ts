import qs from 'qs';
import request from 'request';
import GithubAPI from '@octokit/rest';

import User from './models/User';

const TOKEN_URI = 'https://github.com/login/oauth/access_token';
const AUTHORIZE_URI = 'https://github.com/login/oauth/authorize';

export function setupGithub({ server }) {
  const dev = process.env.NODE_ENV !== 'production';

  let CLIENT_ID = dev ? process.env.Github_Test_ClientID : process.env.Github_Live_ClientID;
  let API_KEY = dev ? process.env.Github_Test_SecretKey : process.env.Github_Live_SecretKey;

  server.get('/auth/github', (req, res) => {
    if (!req.user) {
      res.redirect('/login');
      return;
    }

    // Redirect to Github /oauth/authorize endpoint
    res.redirect(
      `${AUTHORIZE_URI}?${qs.stringify({
        scope: 'repo',
        client_id: CLIENT_ID,
      })}`,
    );
  });

  server.get('/auth/github/callback', (req, res) => {
    if (!req.user) {
      res.redirect('/login');
      return;
    }

    if (req.query.error) {
      res.redirect(`/admin?error=${req.query.error_description}`);
      return;
    }

    const { code } = req.query;

    request.post(
      {
        url: TOKEN_URI,
        headers: { Accept: 'application/json' },
        form: {
          client_id: CLIENT_ID,
          code,
          client_secret: API_KEY,
        },
      },
      async (err, _, body) => {
        if (err) {
          res.redirect(`/admin?error=${err.message || err.toString()}`);
          return;
        }

        const result = JSON.parse(body);

        if (result.error) {
          res.redirect(`/admin?error=${result.error_description}`);
          return;
        }

        try {
          await User.updateOne(
            { _id: req.user.id },
            { $set: { isGithubConnected: true, githubAccessToken: result.access_token } },
          );
          res.redirect('/admin');
        } catch (err2) {
          res.redirect(`/admin?error=${err2.message || err2.toString()}`);
        }
      },
    );
  });
}

function getAPI({ accessToken }) {
  const github = new GithubAPI({
    // debug: true,
    timeout: 10000,
    host: 'api.github.com', // should be api.github.com for GitHub
    protocol: 'https',
    headers: {
      accept: 'application/json',
    },
    requestMedia: 'application/json',
  });

  github.authenticate({
    type: 'oauth',
    token: accessToken,
  });

  return github;
}

export function getRepos({ accessToken }) {
  const github = getAPI({ accessToken });

  return github.repos.getAll({ per_page: 100 });
}

export function getContent({ accessToken, repoName, path }) {
  const github = getAPI({ accessToken });
  const [owner, repo] = repoName.split('/');

  return github.repos.getContent({ owner, repo, path });
}

export function getCommits({ accessToken, repoName, limit }) {
  const github = getAPI({ accessToken });
  const [owner, repo] = repoName.split('/');

  return github.repos.getCommits({ owner, repo, per_page: limit });
}
