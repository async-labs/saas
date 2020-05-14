import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { Provider } from 'mobx-react';
import App from 'next/app';
import React from 'react';

import { themeDark, themeLight } from '../lib/theme';
import { getUser } from '../lib/api/public';
import { getInitialData } from '../lib/api/team-member';
import { isMobile } from '../lib/isMobile';
import { getStore, initStore, Store } from '../lib/store';

class MyApp extends App<{ isMobile: boolean }> {
  public static async getInitialProps({ Component, ctx }) {
    const pageProps = { isMobile: isMobile({ req: ctx.req }) };

    if (Component.getInitialProps) {
      Object.assign(pageProps, await Component.getInitialProps(ctx));
    }

    const appProps = { pageProps };

    // if store initialized already, do not load data again
    if (getStore()) {
      return appProps;
    }

    let user = null;
    try {
      user = ctx.req ? ctx.req.user : await getUser();
    } catch (error) {
      console.log(error);
    }

    let initialData = {};
    const { teamSlug, discussionSlug } = ctx.query;

    if (user) {
      try {
        initialData = await getInitialData({
          request: ctx.req,
          data: { teamSlug, discussionSlug },
        });
      } catch (error) {
        console.error(error);
      }
    }

    return {
      ...appProps,
      initialState: { user, teamSlug, currentUrl: ctx.asPath, ...initialData },
    };
  }

  private store: Store;

  constructor(props) {
    super(props);

    this.store = initStore(props.initialState);
  }

  public componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  public render() {
    const { Component, pageProps } = this.props;
    const store = this.store;

    return (
      <ThemeProvider
        theme={store.currentUser && store.currentUser.darkTheme ? themeDark : themeLight}
      >
        <CssBaseline />
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </ThemeProvider>
    );
  }
}

export default MyApp;
