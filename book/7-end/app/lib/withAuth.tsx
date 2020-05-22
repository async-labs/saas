import { observer } from 'mobx-react';
import Router from 'next/router';
import React from 'react';

import * as NProgress from 'nprogress';

import { getStore, Store } from './store';

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});

Router.events.on('routeChangeComplete', (url) => {
  NProgress.done();

  const store = getStore();
  if (store) {
    store.changeCurrentUrl(url);
  }
});

Router.events.on('routeChangeError', () => NProgress.done());

export default function withAuth(Component, { loginRequired = true, logoutRequired = false } = {}) {
  class WithAuth extends React.Component<{ store: Store }> {
    public static async getInitialProps(ctx) {
      const { req } = ctx;

      let pageComponentProps = {};

      if (Component.getInitialProps) {
        pageComponentProps = await Component.getInitialProps(ctx);
      }

      // const store = getStore();
      // const user = store.currentUser;

      // console.log(user);

      // if (loginRequired && !logoutRequired && !user) {
      //   if (res) {
      //     res.redirect('/login');
      //   } else {
      //     Router.push('/login');
      //   }
      //   return;
      // }

      // let redirectUrl = '/login';
      // let asUrl = '/login';

      // if (user) {
      //   redirectUrl = `/your-settings`;
      //   asUrl = `/your-settings`;
      // }

      // if (logoutRequired && user) {
      //   if (res) {
      //     res.redirect(`${redirectUrl}`);
      //   } else {
      //     Router.push(redirectUrl, asUrl);
      //   }
      // }

      return {
        ...pageComponentProps,
        isServer: !!req,
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
