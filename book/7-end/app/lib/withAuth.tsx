import { observer } from 'mobx-react';
import Router from 'next/router';
import React from 'react';

import * as NProgress from 'nprogress';

import { Store } from './store';

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});

Router.events.on('routeChangeComplete', () => {
  NProgress.done();
});

Router.events.on('routeChangeError', () => NProgress.done());

export default function withAuth(Component, { loginRequired = true, logoutRequired = false, teamRequired = true } = {}) {
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
        teamRequired,
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
        redirectUrl = `/your-settings`;
        asUrl = `/your-settings`;
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
