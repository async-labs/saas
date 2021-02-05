import { observer } from 'mobx-react';
import Router from 'next/router';
import React from 'react';

import * as NProgress from 'nprogress';

import { Store, getStore } from './store';

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});

Router.events.on('routeChangeComplete', (url) => {
  const store = getStore();
  if (store) {
    store.changeCurrentUrl(url);
  }

  if (window && process.env.GA_MEASUREMENT_ID) {
    (window as any).gtag('config', process.env.GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }

  NProgress.done();
});

Router.events.on('routeChangeError', () => NProgress.done());

export default function withAuth(Component, { loginRequired = true, logoutRequired = false } = {}) {
  class WithAuth extends React.Component<{ store: Store }> {
    public static async getInitialProps(ctx) {
      console.log('WithAuth.getInitialProps');

      const { req } = ctx;

      let pageComponentProps = {};

      if (Component.getInitialProps) {
        pageComponentProps = await Component.getInitialProps(ctx);
      }

      return {
        ...pageComponentProps,
        isServer: !!req,
      };
    }

    public componentDidMount() {
      console.log('WithAuth.componentDidMount');

      const { store } = this.props;
      const user = store.currentUser;

      if (loginRequired && !logoutRequired && !user) {
        Router.push('/login');
        return;
      }

      let redirectUrl = '/login';
      let asUrl = '/login';
      if (user) {
        if (!user.defaultTeamSlug) {
          redirectUrl = '/create-team';
          asUrl = '/create-team';
        } else {
          // redirectUrl = `/your-settings`;
          // asUrl = `/your-settings`;
          redirectUrl = `/team/${user.defaultTeamSlug}/discussions`;
          asUrl = `/team/${user.defaultTeamSlug}/discussions`;
        }
      }

      if (logoutRequired && user) {
        Router.push(redirectUrl, asUrl);
      }
    }

    public render() {
      const { store } = this.props;
      const user = store.currentUser;

      if (loginRequired && !logoutRequired && !user) {
        return null;
      }

      if (logoutRequired && user) {
        return null;
      }

      return <Component {...this.props} />;
    }
  }

  return observer(WithAuth);
}
