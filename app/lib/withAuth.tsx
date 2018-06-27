import React from 'react';
import Router from 'next/router';

import { Store } from './store';
import withStore from './withStore';

export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false } = {},
) {
  class App extends React.Component<{ store: Store }> {
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

      let redirectUrl = '/login';
      let asUrl = '/login';
      if (user) {
        if (!user.defaultTeamSlug) {
          redirectUrl = '/settings/create-team';
          asUrl = '/settings/create-team';
        } else {
          redirectUrl = `/topics/detail?teamSlug=${user.defaultTeamSlug}&topicSlug=projects`;
          asUrl = `/team/${user.defaultTeamSlug}/t/projects`;
        }
      }

      if (logoutRequired && user) {
        Router.push(redirectUrl, asUrl);
      }
    }

    render() {
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
