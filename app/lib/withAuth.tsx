import Router from 'next/router';
import React from 'react';

import { Store } from './store';
import withStore from './withStore';

export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false } = {},
) {
  class App extends React.Component<{ store: Store }> {
    public static async getInitialProps(ctx) {
      const props: any = {};

      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
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
        if (!user.defaultTeamSlug) {
          redirectUrl = '/create-team';
          asUrl = '/create-team';
        } else {
          redirectUrl = `/discussion?teamSlug=${user.defaultTeamSlug}`;
          asUrl = `/team/${user.defaultTeamSlug}/d`;
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

      return <BaseComponent {...this.props} />;
    }
  }

  return withStore(App);
}
