import Router from 'next/router';
import React from 'react';

import * as NProgress from 'nprogress';

import { getUser } from '../lib/api/public';

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

export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false } = {},
) {
  class WithAuth extends React.Component<MyProps> {
    public static async getInitialProps(ctx) {
      const { req, pathname } = ctx;

      let baseComponentProps = {};

      let firstGridItem = true;

      if (pathname.includes('/login')) {
        firstGridItem = false;
      }

      if (BaseComponent.getInitialProps) {
        baseComponentProps = await BaseComponent.getInitialProps(ctx);
      }

      const user = await getUser();

      return {
        ...baseComponentProps,
        isServer: !!req,
        firstGridItem,
        user,
      };
    }

    public async componentDidMount() {
      const user = await getUser();

      if (loginRequired && !logoutRequired && !user) {
        Router.push('/login');
        return;
      }

      let redirectUrl = '/login';
      let asUrl = '/login';
      if (user) {
        redirectUrl = `/your-settings`;
        asUrl = `/your-settings`;
      }

      if (logoutRequired && user) {
        Router.push(redirectUrl, asUrl);
      }
    }

    public render() {
      const { user } = this.props;

      if (loginRequired && !logoutRequired && !user) {
        return null;
      }

      if (logoutRequired && user) {
        return null;
      }

      return <BaseComponent {...this.props} />;
    }
  }

  return WithAuth;
}
