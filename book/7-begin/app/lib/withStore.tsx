import React from 'react';

import { getUser } from './api/public';
import { getInitialData } from './api/team-member';
import { getStore, initStore, Store } from './store';

export default function withStore(App) {
  class AppWithMobx extends React.Component {
    public static async getInitialProps(appContext) {
      let appProps = {};
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps.call(App, appContext);
      }

      // if store initialized already, do not load data again
      if (getStore()) {
        return appProps;
      }

      const { ctx } = appContext;
      let user = null;
      try {
        user = ctx.req ? ctx.req.user : await getUser();
      } catch (error) {
        console.log(error);
      }

      let initialData = {};

      // 10
      // const { teamSlug } = ctx.query;

      // 12
      // const { teamSlug, discussionSlug } = ctx.query;

      if (user) {
        try {
          initialData = await getInitialData({
            request: ctx.req,
            // 10
            // data: { teamSlug },

            // 12
            // data: { teamSlug, discussionSlug },
          });
        } catch (error) {
          console.error(error);
        }
      }

      return {
        ...appProps,
        initialState: { user, currentUrl: ctx.asPath, ...initialData },

        // 10
        // initialState: { user, teamSlug, currentUrl: ctx.asPath, ...initialData },
      };
    }

    private store: Store;

    constructor(props) {
      super(props);

      this.store = initStore(props.initialState);
    }

    public render() {
      return <App {...this.props} mobxStore={this.store} />;
    }
  }

  return AppWithMobx;
}
