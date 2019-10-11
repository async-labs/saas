// 3
// import CssBaseline from '@material-ui/core/CssBaseline';
// import { ThemeProvider } from '@material-ui/styles';

// 5
// import { Provider } from 'mobx-react';

import App from 'next/app';
import React from 'react';

import { isMobile } from '../lib/isMobile';

// 5
// import { Store } from '../lib/store';

// 3
// import { themeDark, themeLight } from '../lib/theme';

// 5
// import withStore from '../lib/withStore';

class MyApp extends App<{ isMobile: boolean }> {
  // 5
  // class MyApp extends App<{ mobxStore: Store, isMobile: boolean }> {
  public static async getInitialProps({ Component, ctx }) {
    const pageProps = { isMobile: isMobile({ req: ctx.req }) };

    if (Component.getInitialProps) {
      Object.assign(pageProps, await Component.getInitialProps(ctx));
    }

    return { pageProps };
  }

  constructor(props) {
    super(props);
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

    // 5
    // const { Component, pageProps, mobxStore } = this.props;

    return (
      <Component {...pageProps} />
      // <ThemeProvider
      //   theme={themeDark || themeLight}
      //   // theme={mobxStore.currentUser && mobxStore.currentUser.darkTheme ? themeDark : themeLight}
      // >
      //   {/* ThemeProvider makes the theme available down the React tree thanks to React context. */}
      //   {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      //   <CssBaseline />
      //   <Component {...pageProps} />
      //   {/* 5 */}
      //   {/* <Provider store={mobxStore}>
      //     <Component {...pageProps} />
      //   </Provider> */}
      // </ThemeProvider>
    );
  }
}

export default MyApp;

// 5
// export default withStore(MyApp);
