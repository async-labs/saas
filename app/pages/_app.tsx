import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Provider } from 'mobx-react';
import App, { Container } from 'next/app';
import React from 'react';
import JssProvider from 'react-jss/lib/JssProvider';

import getContext from '../lib/context';
import { isMobile } from '../lib/isMobile';
import { Store } from '../lib/store';
import withStore from '../lib/withStore';

class MyApp extends App<{ mobxStore: Store, isMobile: boolean }> {
  public static async getInitialProps({ Component, ctx }) {
    const pageProps = { isMobile: isMobile({ req: ctx.req }) };

    if (Component.getInitialProps) {
      Object.assign(pageProps, await Component.getInitialProps(ctx));
    }

    return { pageProps };
  }

  public pageContext: any;

  constructor(props) {
    super(props);
    this.pageContext = getContext({ store: props.mobxStore });
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
        {/* Wrap every page in Jss and Theme providers */}
        <JssProvider
          registry={this.pageContext.sheetsRegistry}
          generateClassName={this.pageContext.generateClassName}
        >
          {/* MuiThemeProvider makes the theme available down the React
              tree thanks to React context. */}
          <MuiThemeProvider
            theme={this.pageContext.theme}
            sheetsManager={this.pageContext.sheetsManager}
          >
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Provider store={mobxStore}>
              {/* Pass pageContext to the _document though the renderPage enhancer
                to render collected styles on server side. */}
              <Component pageContext={this.pageContext} {...pageProps} />
            </Provider>
          </MuiThemeProvider>
        </JssProvider>
      </Container>
    );
  }
}

export default withStore(MyApp);
