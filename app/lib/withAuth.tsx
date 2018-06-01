import React from 'react';
import Router from 'next/router';

import { Store } from './store';
import withStore from './withStore';

export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false, adminRequired = false } = {},
) {
  class App extends React.Component<{ store: Store; teamSlug: string }> {
    static async getInitialProps(ctx) {
      const props: any = {};

      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    componentDidMount() {
      const { store } = this.props;

      const user = store.currentUser;
      if (loginRequired && !logoutRequired && !user) {
        Router.push('/login');
        return;
      }

      if (adminRequired && (!user || !user.isAdmin)) {
        Router.push('/');
      }

      if (logoutRequired && user) {
        Router.push('/');
      }
    }

    render() {
      const { store } = this.props;
      const user = store.currentUser;

      if (loginRequired && !logoutRequired && !user) {
        return null;
      }

      if (adminRequired && (!user || !user.isAdmin)) {
        return null;
      }

      if (logoutRequired && user) {
        return null;
      }

      return <BaseComponent {...this.props} />;
    }
  }

  return withStore(App);
}
