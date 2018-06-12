import React from 'react';
import NProgress from 'nprogress';
import { observer } from 'mobx-react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Grid, CssBaseline, Avatar } from '@material-ui/core';
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
    href: `/team/${t.slug}/t/projects`,
    as: `/team/${t.slug}/t/projects`,
    simple: false,
    highlighterSlug: `/${t.slug}`,
  }));

const menuUnderTeamList = team => [
  {
    separator: true,
  },
  {
    text: `Settings`,
    href: `/team/${team.slug}/settings/team-members`,
    as: `/team/${team.slug}/settings/team-members`,
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

  @observer
  class App extends React.Component<MyProps> {
    public static defaultProps: { pageContext: null };

    constructor(props, context) {
      super(props, context);
      this.pageContext = this.props.pageContext || getContext();
    }

    static async getInitialProps({ query, ctx, req }) {
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

      return { baseComponentProps, teamSlug, topicSlug, discussionSlug, isServer: !!req };
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
      }
    }

    pageContext = null;

    render() {
      // TODO: use teamRequired to check for Team
      // Add teamRequired: false to some pages that don't require team

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

      if (teamRequired && !store.currentTeam) {
        console.log(store.currentTeam);
        return (
          <div>
            <Link href="/settings/create-team">
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
            style={{ padding: '0px 10px', height: '100%' }}
          >
            <Grid item sm={1} xs={12} style={{ borderRight: '0.5px #aaa solid' }}>
              <MenuWithLinks
                options={getTeamOptionsMenuWithLinks(store.teams).concat(
                  menuUnderTeamList(store.currentTeam),
                )}
              >
                <Avatar
                  src={`${store.currentTeam.avatarUrl ||
                    'https://storage.googleapis.com/async-await/async-logo-40.svg'}`}
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
                <ActiveLink
                  linkText="Projects"
                  href={`/team/${store.currentTeam.slug}/t/projects`}
                  as={`/team/${store.currentTeam.slug}/t/projects`}
                  highlighterSlug={`/projects`}
                />
                <p />
                <TopicList store={this.props.store} />
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
