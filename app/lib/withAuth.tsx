import React from 'react';
import Router from 'next/router';

import { getStore, User } from './store';

export default function withAuth(
  BaseComponent,
  { loginRequired = true, logoutRequired = false, adminRequired = false } = {},
) {
  class App extends React.PureComponent<{ user: User; isFromServer: boolean; teamSlug: string }> {
    static async getInitialProps(ctx) {
      const isFromServer = !!ctx.req;
      const user = ctx.req ? ctx.req.user && ctx.req.user : getStore().currentUser;

      const props = { user, isFromServer };

      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      return props;
    }

    componentDidMount() {
      const { user, teamSlug } = this.props;

      if (this.props.isFromServer) {
        const store = getStore();

        store.changeUserState(user, teamSlug);
      }

      if (loginRequired && !logoutRequired && !user) {
        Router.push('/public/login', '/login');
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
      const { user } = this.props;

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

  return App;
}
