import { inject, Provider } from 'mobx-react';
import React from 'react';

import { getUser } from './api/public';
import { getInitialData } from './api/team-member';
import { getStore, initStore, Store } from './store';

export default function withStore(BaseComponent) {
  BaseComponent = inject('store')(BaseComponent);

  class App extends React.Component {
    public static async getInitialProps(ctx) {
      const props: any = {};

      // if store initialized already do not load data again
      if (getStore()) {
        if (BaseComponent.getInitialProps) {
          Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
        }

        return props;
      }

      let user = null;
      try {
        user = ctx.req ? ctx.req.user : await getUser();
      } catch (error) {
        console.log(error);
      }

      if (BaseComponent.getInitialProps) {
        Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {});
      }

      const { teamSlug, discussionSlug } = props;
      let initialData = {};

      if (user) {
        try {
          initialData = await getInitialData({
            request: ctx.req,
            data: { teamSlug, discussionSlug },
          });
        } catch (error) {
          console.log(error);
        }
      }

      Object.assign(props, {
        initialState: { user, teamSlug, currentUrl: ctx.asPath, ...initialData },
      });

      return props;
    }

    public store: Store;

    constructor(props) {
      super(props);

      this.store = initStore(props.initialState);
    }

    public render() {
      return (
        <Provider store={this.store}>
          <BaseComponent {...this.props} />
        </Provider>
      );
    }
  }

  return App;
}
