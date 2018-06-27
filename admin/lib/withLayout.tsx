import React from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import { observer } from 'mobx-react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';

import getContext from '../lib/context';
import Notifier from '../components/common/Notifier';
import Confirm from '../components/common/Confirm';
import MenuWithLinks from '../components/common/MenuWithLinks';
import { Store } from './store';

// require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const LOG_OUT_URL = dev ? 'http://localhost:9000' : process.env.PRODUCTION_URL_ADMIN;

const styleLoadingDiv = {
  padding: '20px',
};

Router.onRouteChangeStart = () => {
  NProgress.start();
};

Router.onRouteChangeComplete = () => {
  NProgress.done();
};

Router.onRouteChangeError = () => NProgress.done();

const menuUnderTeamList = () => [
  {
    text: 'Admin',
    href: '/settings/admin',
    simple: true,
  },
  {
    text: 'Stats',
    href: '/settings/stats',
    simple: true,
  },
  {
    text: 'Log out',
    href: `${LOG_OUT_URL}/logout`,
    as: `${LOG_OUT_URL}/logout`,
    simple: true,
  },
];

function ThemeWrapper({ children, pageContext }) {
  return (
    <MuiThemeProvider theme={pageContext.theme} sheetsManager={pageContext.sheetsManager}>
      <CssBaseline />
      {children}
      <Notifier />
      <Confirm />
    </MuiThemeProvider>
  );
}

function withLayout(BaseComponent, { teamRequired = true } = {}) {
  type MyProps = { pageContext: object; store: Store; teamSlug: string };
  type MyState = { isTL: boolean; isAdmin: boolean };

  @observer
  class App extends React.Component<MyProps, MyState> {
    public static defaultProps: { pageContext: null };

    constructor(props, context) {
      super(props, context);
      this.pageContext = this.props.pageContext || getContext();

      const { currentTeam, currentUser } = props.store;
      this.state = {
        isTL: (currentUser && currentTeam && currentUser._id === currentTeam.teamLeaderId) || false,
        isAdmin: (currentUser && currentUser.isAdmin) || false,
      };
    }

    static async getInitialProps(ctx) {
      const { query, req } = ctx;

      let baseComponentProps = {};
      let teamSlug = '';

      const topicSlug = query.topicSlug;
      const discussionSlug = query.discussionSlug;

      if (BaseComponent.getInitialProps) {
        baseComponentProps = await BaseComponent.getInitialProps(ctx);
      }

      if (teamRequired) {
        teamSlug = query.teamSlug;
      }

      return { ...baseComponentProps, teamSlug, topicSlug, discussionSlug, isServer: !!req };
    }

    componentDidMount() {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    pageContext = null;

    render() {
      const { store } = this.props;
      // console.log(this.state.isTL, this.state.isAdmin);

      if (store.isLoggingIn) {
        return <div style={styleLoadingDiv}>loading User ...</div>;
      }

      if (!store.currentUser) {
        return (
          <ThemeWrapper pageContext={this.pageContext}>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="stretch"
              style={{ height: '100%' }}
            >
              <Grid item sm={12} xs={12}>
                <BaseComponent {...this.props} />
              </Grid>
            </Grid>
          </ThemeWrapper>
        );
      }

      return (
        <ThemeWrapper pageContext={this.pageContext}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            style={{ padding: '0px 10px', height: '100%' }}
          >
            <Grid item sm={1} xs={12} style={{ borderRight: '0.5px #aaa solid' }}>
              <MenuWithLinks options={menuUnderTeamList()}>
                <Avatar
                  src={'https://storage.googleapis.com/async-await/async-logo-40.svg'}
                  alt="Team logo"
                  style={{
                    margin: '20px auto',
                    cursor: 'pointer',
                    display: 'inline-flex',
                  }}
                />

                <i className="material-icons" color="action" style={{ verticalAlign: 'super' }}>
                  arrow_drop_down
                </i>
              </MenuWithLinks>
              <hr />
            </Grid>
            <Grid item sm={11} xs={12}>
              <BaseComponent isTL={this.state.isTL} isAdmin={this.state.isAdmin} {...this.props} />
            </Grid>
          </Grid>
        </ThemeWrapper>
      );
    }
  }

  return App;
}

export default withLayout;
