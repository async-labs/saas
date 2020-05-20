import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { Provider } from 'mobx-react';
import App from 'next/app';
import React from 'react';

import { themeDark, themeLight } from '../lib/theme';
import { getUserApiMethod } from '../lib/api/public';
// import { getInitialDataApiMethod } from '../lib/api/team-member';
import { isMobile } from '../lib/isMobile';
import { getStore, initStore, Store } from '../lib/store';

class MyApp extends App<{ isMobile: boolean }> {
  public static async getInitialProps({ Component, ctx }) {
    let firstGridItem = true;

    if (ctx.pathname.includes('/login')) {
      firstGridItem = false;
    }

    const pageProps = { isMobile: isMobile({ req: ctx.req }), firstGridItem };

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
      user = ctx.req ? ctx.req.user : await getUserApiMethod();
    } catch (error) {
      console.log(error);
    }

    // let initialData = {};
    // const { teamSlug, discussionSlug } = ctx.query;

    // if (user) {
    //   try {
    //     initialData = await getInitialDataApiMethod({
    //       request: ctx.req,
    //       data: { teamSlug, discussionSlug },
    //     });
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }

    return {
      ...appProps,
      initialState: { user, currentUrl: ctx.asPath },
    };
  }

  public componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  private store: Store;

  constructor(props) {
    super(props);

    this.store = initStore(props.initialState);
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
          <Component {...pageProps} store={store} />
        </Provider>
      </ThemeProvider>
    );
  }
}

export default MyApp;
