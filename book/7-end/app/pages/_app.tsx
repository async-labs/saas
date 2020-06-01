import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { Provider } from 'mobx-react';
import App from 'next/app';
import React from 'react';

import { themeDark, themeLight } from '../lib/theme';
import { getUserApiMethod } from '../lib/api/public';
// import { getInitialDataApiMethod } from '../lib/api/team-member';
import { isMobile } from '../lib/isMobile';
import { getStore, initializeStore, Store } from '../lib/store';


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

    const store = getStore();
    if (store) {
      return appProps;
    }

    const { req } = ctx;

    const headers: any = {};
    if (req.headers && req.headers.cookie) {
      headers.cookie = req.headers.cookie;
    }

    let userObj = null;
    try {
      const { user } = await getUserApiMethod({ headers});
      userObj = user;
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
      initialState: { user: userObj, currentUrl: ctx.asPath },
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

    console.log('MyApp.constructor');

    this.store = initializeStore(props.initialState);
  }

  public render() {
    const { Component, pageProps } = this.props;
    const store = this.store;

    console.log(store.currentUser);

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
