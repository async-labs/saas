import React from 'react';
import NProgress from 'nprogress';
import { observer } from 'mobx-react';
import { MuiThemeProvider } from 'material-ui/styles';
import CssBaseline from 'material-ui/CssBaseline';
import Grid from 'material-ui/Grid';
import Icon from 'material-ui/Icon';
import Avatar from 'material-ui/Avatar';
import Tooltip from 'material-ui/Tooltip';
import Router from 'next/router';
import Link from 'next/link';

import TopicList from '../components/topics/TopicList';
import getContext from '../lib/context';
import Notifier from '../components/common/Notifier';
import Confirm from '../components/common/Confirm';
import MenuDrop from '../components/common/MenuDrop';
import { getStore } from './store';
import * as gtag from './gtag';

Router.onRouteChangeStart = () => {
  NProgress.start();
};

Router.onRouteChangeComplete = url => {
  NProgress.done();
  gtag.pageview(url);
};

Router.onRouteChangeError = () => NProgress.done();

const dev = process.env.NODE_ENV !== 'production';
const LOG_OUT_URL = dev ? 'http://localhost:8000' : 'https://api1.async-await.com';

const getTeamOptionsMenu = team => [
  {
    text: 'Main page',
    href: '/',
  },
  {
    text: 'Settings',
    href: `/settings?teamSlug=${team.slug}`,
    as: `/team/${team.slug}/settings`,
  },
  {
    text: 'Log out',
    href: `${LOG_OUT_URL}/logout`,
    noPrefetch: true,
  },
];

const store = getStore();
function withLayout(BaseComponent) {
  @observer
  class App extends React.Component<{ pageContext: object }> {
    public static defaultProps: { pageContext: null };

    constructor(props, context) {
      super(props, context);
      this.pageContext = this.props.pageContext || getContext();
    }

    static getInitialProps(ctx) {
      if (BaseComponent.getInitialProps) {
        return BaseComponent.getInitialProps(ctx);
      }

      return {};
    }

    componentDidMount() {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    pageContext = null;

    render() {
      if (store.isLoggingIn) {
        return <div>1-loading...</div>;
      }

      if (!store.currentUser) {
        return (
          <MuiThemeProvider
            theme={this.pageContext.theme}
            sheetsManager={this.pageContext.sheetsManager}
          >
            <CssBaseline />
            <div>
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
              <Notifier />
            </div>
          </MuiThemeProvider>
        );
      }

      if (store.isLoadingTeams || !store.isInitialTeamsLoaded) {
        return <div>2-loading...</div>;
      }

      if (!store.currentTeam) {
        Router.push('/settings/add-team');
        return <div>3-loading...</div>;
      }

      return (
        <MuiThemeProvider
          theme={this.pageContext.theme}
          sheetsManager={this.pageContext.sheetsManager}
        >
          <CssBaseline />
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            style={{ padding: '20px', height: '100%' }}
          >
            <Grid item sm={1} xs={12} style={{ borderRight: '0.5px #aaa solid' }}>
              <MenuDrop options={getTeamOptionsMenu(store.currentTeam)}>
                <Avatar
                  src={`${store.currentTeam.avatarUrl ||
                    'https://storage.googleapis.com/async-await/async-logo-40.svg'}`}
                  alt="Team logo"
                  style={{
                    margin: '10px auto 20px 0px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                  }}
                />

                <Icon color="action" style={{ verticalAlign: 'super' }}>
                  arrow_drop_down
                </Icon>
              </MenuDrop>
              <hr />
              <div>
                <Link prefetch href="/projects">
                  <a>Projects</a>
                </Link>
                <p />
                <Link prefetch href="/knowledge">
                  <a>Knowledge</a>
                </Link>
                <p />
                <hr />
                <TopicList />
                <hr />
                <p />
                <p style={{ display: 'inline' }}>Private</p>
                <Tooltip title="Add new Topic" placement="right">
                  <a href="#" style={{ float: 'right', padding: '0px 10px' }}>
                    <Icon color="action" style={{ fontSize: 14, opacity: 0.7 }}>
                      add_circle
                    </Icon>{' '}
                  </a>
                </Tooltip>
                <ul>
                  <p />
                  <Link prefetch href="/tima">
                    <a>Tima</a>
                  </Link>
                  <p />
                  <Link prefetch href="/kelly">
                    <a>Kelly</a>
                  </Link>
                  <p />
                </ul>
              </div>
            </Grid>

            <Grid item sm={11} xs={12}>
              <BaseComponent {...this.props} />
            </Grid>
          </Grid>
          <Notifier />
          <Confirm />
        </MuiThemeProvider>
      );
    }
  }

  return App;
}

export default withLayout;
