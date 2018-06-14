import React from 'react';
import Router from 'next/router';
import Link from 'next/link';
import NProgress from 'nprogress';
import { observer } from 'mobx-react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';

import TopicList from '../components/topics/TopicList';
import getContext from '../lib/context';
import Notifier from '../components/common/Notifier';
import Confirm from '../components/common/Confirm';
import MenuWithLinks from '../components/common/MenuWithLinks';
import * as gtag from './gtag';
import { Store } from './store';

const dev = process.env.NODE_ENV !== 'production';
const LOG_OUT_URL = dev ? 'http://localhost:8000' : 'https://api1.async-await.com';

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
    href: `/topics/detail?teamSlug=${t.slug}&topicSlug=projects`,
    as: `/team/${t.slug}/t/projects`,
    simple: false,
    highlighterSlug: `/${t.slug}`,
  }));

const menuUnderTeamList = (team, isTL) => [
  {
    separator: true,
  },
  {
    text: 'Create new team',
    href: '/settings/create-team',
    simple: true,
  },
  isTL
    ? {
        text: `Settings`,
        href: `/settings/team-members?teamSlug=${team.slug}`,
        as: `/team/${team.slug}/settings/team-members`,
        simple: true,
      }
    : {
        text: `Settings`,
        href: `/settings/your-profile`,
        simple: true,
      },
  {
    text: 'Log out',
    href: `${LOG_OUT_URL}/logout`,
    as: `${LOG_OUT_URL}/logout`,
    simple: true,
  },
];

function withLayout(BaseComponent, { teamRequired = true } = {}) {
  type MyProps = { pageContext: object; store: Store; teamSlug: string };
  type MyState = { isTL: boolean };

  @observer
  class App extends React.Component<MyProps, MyState> {
    public static defaultProps: { pageContext: null };

    constructor(props, context) {
      super(props, context);
      this.pageContext = this.props.pageContext || getContext();

      const { currentTeam, currentUser } = props.store;
      this.state = {
        isTL: (currentUser && currentTeam && currentUser._id === currentTeam.teamLeaderId) || false,
      };
    }

    static async getInitialProps(ctx) {
      const { query, req } = ctx;

      let baseComponentProps = {};
      let teamSlug = '';
      let topicSlug = '';
      let discussionSlug = '';

      if (BaseComponent.getInitialProps) {
        baseComponentProps = await BaseComponent.getInitialProps(ctx);
      }

      if (teamRequired) {
        teamSlug = query.teamSlug;
      }

      topicSlug = query.topicSlug;
      discussionSlug = query.discussionSlug;

      return { ...baseComponentProps, teamSlug, topicSlug, discussionSlug, isServer: !!req };
    }

    componentDidMount() {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }

      if (teamRequired) {
        this.checkTeam();
      }
    }

    componentDidUpdate() {
      if (teamRequired) {
        this.checkTeam();
      }
    }

    checkTeam() {
      const { teamSlug, store } = this.props;
      const { currentTeam } = store;

      if (!currentTeam || currentTeam.slug !== teamSlug) {
        store.setCurrentTeam(teamSlug);

        const { currentTeam: newTeam, currentUser } = store;
        const isTL = (currentUser && newTeam && currentUser._id === newTeam.teamLeaderId) || false;

        if (this.state.isTL !== isTL) {
          this.setState({ isTL });
        }
      }
    }

    pageContext = null;

    render() {
      // TODO: use teamRequired to check for Team
      // Add teamRequired: false to some pages that don't require team

      const { store } = this.props;

      //

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
            style={{ padding: '0px 10px', height: '100%' }}
          >
            <Grid item sm={1} xs={12} style={{ borderRight: '0.5px #aaa solid' }}>
              <MenuWithLinks
                options={getTeamOptionsMenuWithLinks(store.teams).concat(
                  menuUnderTeamList(store.currentTeam, this.state.isTL),
                )}
              >
                <Avatar
                  src={
                    store.currentTeam
                      ? store.currentTeam.avatarUrl
                      : 'https://storage.googleapis.com/async-await/async-logo-40.svg'
                  }
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
              <div>
                <p />
                <p />
                <TopicList store={this.props.store} />
              </div>
            </Grid>

            {teamRequired && !store.currentTeam ? (
              <Grid item sm={11} xs={12}>
                <Link prefetch href="/settings/create-team">
                  <Button style={{ margin: '20px' }} variant="outlined">
                    Create team
                  </Button>
                </Link>
              </Grid>
            ) : (
              <Grid item sm={11} xs={12}>
                <BaseComponent isTL={this.state.isTL} {...this.props} />
              </Grid>
            )}
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
