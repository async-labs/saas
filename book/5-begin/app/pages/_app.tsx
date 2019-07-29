import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { Provider } from 'mobx-react';
import App, { Container } from 'next/app';
import React from 'react';

import { isMobile } from '../lib/isMobile';
import { Store } from '../lib/store';
import { themeDark, themeLight } from '../lib/theme';
import withStore from '../lib/withStore';

class MyApp extends App<{ mobxStore: Store, isMobile: boolean }> {
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
    const { Component, pageProps, mobxStore } = this.props;

    return (
      <Container>
        {/* ThemeProvider makes the theme available down the React
              tree thanks to React context. */}
        <ThemeProvider
          theme={mobxStore.currentUser && mobxStore.currentUser.darkTheme ? themeDark : themeLight}
        >
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Provider store={mobxStore}>
            <Component {...pageProps} />
          </Provider>
        </ThemeProvider>
      </Container>
    );
  }
}

export default withStore(MyApp);
