import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'mobx-react';
import App from 'next/app';
import Head from 'next/head';
import React from 'react';

import { themeDark, themeLight } from '../lib/theme';
import { getUserApiMethod } from '../lib/api/public';
import { getInitialDataApiMethod } from '../lib/api/team-member';
import { isMobile } from '../lib/isMobile';
import { getStore, initializeStore, Store } from '../lib/store';

class MyApp extends App {
  public static async getInitialProps({ Component, ctx }) {
    console.log('MyApp.getInitialProps');

    let firstGridItem = true;
    let teamRequired = false;

    if (
      ctx.pathname.includes('/login') ||
      ctx.pathname.includes('/create-team') ||
      ctx.pathname.includes('/invitation')
    ) {
      firstGridItem = false;
    }

    if (
      ctx.pathname.includes('/your-settings') ||
      ctx.pathname.includes('/team-settings') ||
      ctx.pathname.includes('/discussion') ||
      ctx.pathname.includes('/billing')
    ) {
      teamRequired = true;
    }

    const { teamSlug, redirectMessage, discussionSlug } = ctx.query;

    const pageProps = {
      isMobile: isMobile({ req: ctx.req }),
      firstGridItem,
      teamRequired,
      teamSlug,
      redirectMessage,
      discussionSlug,
    };

    if (Component.getInitialProps) {
      Object.assign(pageProps, await Component.getInitialProps(ctx));
    }

    const appProps = { pageProps };

    console.log('before getStore');

    const store = getStore();
    if (store) {
      return appProps;
    }

    let userObj = null;
    try {
      const { user } = await getUserApiMethod(ctx.req);
      userObj = user;
    } catch (error) {
      console.log(error);
    }

    let initialData;

    if (userObj) {
      try {
        initialData = await getInitialDataApiMethod({
          request: ctx.req,
          data: { teamSlug, discussionSlug },
        });
      } catch (error) {
        console.error(error);
      }
    }

    // console.log(initialData);

    let selectedTeamSlug = '';

    if (teamRequired) {
      selectedTeamSlug = teamSlug;
    } else if (userObj) {
      selectedTeamSlug = userObj.defaulTeamSlug;
    }

    let team;
    if (initialData && initialData.teams) {
      team = initialData.teams.find((t) => {
        return t.slug === selectedTeamSlug || userObj.defaultTeamSlug;
      });
    }

    console.log(initialData.teams, team);

    return {
      ...appProps,
      initialState: { user: userObj, currentUrl: ctx.asPath, team, teamSlug, ...initialData },
    };
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

    const isThemeDark = store.currentUser ? store.currentUser.darkTheme : true;

    const isServer = typeof window === 'undefined';

    return (
      <CacheProvider value={createCache({ key: 'css' })}>
        <ThemeProvider theme={isThemeDark ? themeDark : themeLight}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" href={isServer ? '/fonts/server.css' : '/fonts/cdn.css'} />
            <link
              rel="stylesheet"
              href={
                isThemeDark
                  ? 'https://storage.googleapis.com/async-await/nprogress-light-spinner.css'
                  : 'https://storage.googleapis.com/async-await/nprogress-dark-spinner.css'
              }
            />
          </Head>
          <CssBaseline />
          <Provider store={store}>
            <Component {...pageProps} store={store} />
          </Provider>
        </ThemeProvider>
      </CacheProvider>
    );
  }
}

export default MyApp;
