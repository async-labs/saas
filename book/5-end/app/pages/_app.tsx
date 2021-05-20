import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import App from 'next/app';
import Head from 'next/head';
import React from 'react';
import { isMobile } from '../lib/isMobile';
import { themeDark, themeLight } from '../lib/theme';

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

    return { pageProps };
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

    return (
      <ThemeProvider theme={false ? themeDark : themeLight}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link
            rel="stylesheet"
            href="https://storage.googleapis.com/async-await/nprogress-light.min.css"
          />
        </Head>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }
}

export default MyApp;
