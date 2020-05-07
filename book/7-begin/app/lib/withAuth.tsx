import Router from 'next/router';
import React from 'react';

import * as NProgress from 'nprogress';

import { getUserApiMethod } from '../lib/api/public';

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});

Router.events.on('routeChangeComplete', () => {
  NProgress.done();
});

Router.events.on('routeChangeError', () => NProgress.done());

type MyProps = {
  user: { email: string; displayName: string; slug: string; avatarUrl: string };
};

export default function withAuth(Component, { loginRequired = true, logoutRequired = false } = {}) {
  class WithAuth extends React.Component<MyProps> {
    public static async getInitialProps(ctx) {
      const { req, res } = ctx;

      let pageComponentProps = {};

      if (Component.getInitialProps) {
        pageComponentProps = await Component.getInitialProps(ctx);
      }

      const headers: any = {};
      if (req.headers && req.headers.cookie) {
        headers.cookie = req.headers.cookie;
      }

      const { user } = await getUserApiMethod({ headers });

      console.log(user);

      if (loginRequired && !logoutRequired && !user) {
        if (res) {
          res.redirect('/login');
        } else {
          Router.push('/login');
        }
        return;
      }

      let redirectUrl = '/login';
      let asUrl = '/login';

      if (user) {
        redirectUrl = `/your-settings`;
        asUrl = `/your-settings`;
      }

      if (logoutRequired && user) {
        if (res) {
          res.redirect(`${redirectUrl}`);
        } else {
          Router.push(redirectUrl, asUrl);
        }
      }

      return {
        ...pageComponentProps,
        user,
      };
    }

    public render() {
      const { user } = this.props;

      if (loginRequired && !logoutRequired && !user) {
        return null;
      }

      if (logoutRequired && user) {
        return null;
      }

      return <Component {...this.props} />;
    }
  }

  return WithAuth;
}
