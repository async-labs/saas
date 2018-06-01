import React from 'react';
import NProgress from 'nprogress';
import { observer } from 'mobx-react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Router from 'next/router';
import Link from 'next/link';

import TopicList from '../components/topics/TopicList';
import getContext from '../lib/context';
import Notifier from '../components/common/Notifier';
import Confirm from '../components/common/Confirm';
import MenuWithLinks from '../components/common/MenuWithLinks';
import ActiveLink from '../components/common/ActiveLink';
import * as gtag from './gtag';
import { Store } from './store';

Router.onRouteChangeStart = () => {
  NProgress.start();
};

Router.onRouteChangeComplete = url => {
  NProgress.done();
  gtag.pageview(url);
};

Router.onRouteChangeError = () => NProgress.done();

const getTeamOptionsMenuWithLinks = teams =>
  teams.map(t => ({
    text: t.name,
    avatarUrl: t.avatarUrl,
    href: `/projects?teamSlug=${t.slug}`,
    as: `/team/${t.slug}/projects`,
  }));

function withLayout(BaseComponent) {
  @observer
  class App extends React.Component<{ pageContext: object; store: Store }> {
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
      const { store } = this.props;

      if (store.isLoggingIn) {
        return <div style={{ color: 'black' }}>1-loading...</div>;
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
        return <div style={{ color: 'black' }}>2-loading...</div>;
      }

      if (!store.currentTeam) {
        return (
          <div>
            <Link href="/settings/add-team">
              <a style={{ color: 'black' }}>Add team</a>
            </Link>
          </div>
        );
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
            style={{ padding: '20px 10px', height: '100%' }}
          >
            <Grid item sm={1} xs={12} style={{ borderRight: '0.5px #aaa solid' }}>
              <MenuWithLinks options={getTeamOptionsMenuWithLinks(store.teams)}>
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

                <i className="material-icons" color="action" style={{ verticalAlign: 'super' }}>
                  arrow_drop_down
                </i>
              </MenuWithLinks>
              <hr />
              <div>
                <p />
                <ActiveLink
                  linkText="Projects"
                  href={`/projects?teamSlug=${store.currentTeam.slug}&topicSlug=projects`}
                  as={`/team/${store.currentTeam.slug}/projects`}
                />
                <p />
                <hr />
                <TopicList />
                <hr />
                <div
                  style={{
                    position: 'fixed',
                    bottom: '40px',
                  }}
                >
                  <ActiveLink
                    linkText="Settings"
                    href={`/settings?teamSlug=${store.currentTeam.slug}`}
                    as={`/team/${store.currentTeam.slug}/settings`}
                  />
                </div>
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
