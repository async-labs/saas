import { inject, observer } from 'mobx-react';
import Router from 'next/router';
import React from 'react';

import * as NProgress from 'nprogress';
import * as gtag from './gtag';
import { getStore, Store } from './store';

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});

Router.events.on('routeChangeComplete', (url) => {
  NProgress.done();
  gtag.pageview(url);

  const store = getStore();
  if (store) {
    store.changeCurrentUrl(url);
  }
});

Router.events.on('routeChangeError', () => NProgress.done());

export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false } = {},
  // 10
  // { loginRequired = true, logoutRequired = false, teamRequired = true } = {},
) {
  BaseComponent = inject('store')(BaseComponent);

  class WithAuth extends React.Component<{ store: Store }> {
    public static async getInitialProps(ctx) {
      const { req, pathname } = ctx;

      // 10
      // const { query, req, pathname } = ctx;

      let baseComponentProps = {};

      let firstGridItem = true;

      if (
        pathname.includes('/login') ||
        pathname.includes('/signup')
        // 10
        // pathname.includes('/invitation') ||
        // pathname.includes('/create-team')
      ) {
        firstGridItem = false;
      }

      // 10
      // const { teamSlug } = query;

      // 12
      // const { teamSlug, discussionSlug } = query;

      if (BaseComponent.getInitialProps) {
        baseComponentProps = await BaseComponent.getInitialProps(ctx);
      }

      return {
        ...baseComponentProps,
        // 10
        // teamSlug,
        // teamRequired,

        // 12
        // discussionSlug,
        isServer: !!req,
        firstGridItem,
      };
    }

    public componentDidMount() {
      const { store } = this.props;

      const user = store.currentUser;

      if (loginRequired && !logoutRequired && !user) {
        Router.push('/login');
        return;
      }

      let redirectUrl = '/login';
      let asUrl = '/login';
      if (user) {
        redirectUrl = '/your-settings';
        asUrl = '/your-settings';

        // 10
        // if (!user.defaultTeamSlug) {
        //   redirectUrl = '/create-team';
        //   asUrl = '/create-team';
        // }

        // 12
        // if (!user.defaultTeamSlug) {
        //   redirectUrl = '/create-team';
        //   asUrl = '/create-team';
        // } else {
        //   redirectUrl = `/discussion?teamSlug=${user.defaultTeamSlug}`;
        //   asUrl = `/team/${user.defaultTeamSlug}/discussions`;
        // }
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

      return <BaseComponent {...this.props} />;
    }
  }

  return inject('store')(observer(WithAuth));
}
