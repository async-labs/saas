import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import Router from 'next/router';
import NProgress from 'nprogress';
import React from 'react';

import Confirm from '../components/common/Confirm';
import Loading from '../components/common/Loading';
import MenuWithLinks from '../components/common/MenuWithLinks';
import Notifier from '../components/common/Notifier';
import DiscussionList from '../components/discussions/DiscussionList';
import getContext from './context';
import env from './env';
import * as gtag from './gtag';
import { getStore, Store } from './store';

const styleGrid = {
  width: '100vw',
  minHeight: '100vh',
  maxWidth: '100%',
  padding: '0px 10px',
};

const styleNoTeamDiv = {
  padding: '20px',
};

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_API } = env;
const LOG_OUT_URL = dev ? 'http://localhost:8000' : PRODUCTION_URL_API;

Router.onRouteChangeStart = () => {
  NProgress.start();
};

Router.onRouteChangeComplete = url => {
  NProgress.done();
  gtag.pageview(url);

  const store = getStore();
  if (store) {
    store.changeCurrentUrl(url);
  }
};

Router.onRouteChangeError = () => NProgress.done();

const getTeamOptionsMenuWithLinksLeft = teams =>
  teams.map(t => ({
    text: t.name,
    avatarUrl: t.avatarUrl,
    href: `/project?teamSlug=${t.slug}`,
    as: `/team/${t.slug}/projects`,
    simple: false,
    highlighterSlug: `/team/${t.slug}/`,
  }));

const menuUnderTeamListLeftTL = team => [
  {
    separator: true,
  },
  {
    text: 'Team Settings',
    href: `/settings/team-members?teamSlug=${team.slug}`,
    as: `/team/${team.slug}/settings/team-members`,
    simple: true,
    highlighterSlug: '/settings/team-',
  },
  {
    text: 'Create new Team',
    href: '/create-team',
    simple: true,
    highlighterSlug: '/create-team',
  },
];

const menuUnderTeamListLeft = () => [
  {
    separator: true,
  },
  {
    text: 'Create new Team',
    href: '/create-team',
    simple: true,
    highlighterSlug: '/create-team',
  },
];

const menuUnderTeamListRight = () => [
  {
    text: 'Your Settings',
    href: '/settings/your-settings',
    simple: true,
    highlighterSlug: '/your-settings',
  },
  {
    text: 'Log out',
    href: `${LOG_OUT_URL}/logout`,
    as: `${LOG_OUT_URL}/logout`,
    simple: true,
  },
];

function ThemeWrapper({ children, pageContext, firstGridItem }) {
  return (
    <MuiThemeProvider theme={pageContext.theme} sheetsManager={pageContext.sheetsManager}>
      <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
        {firstGridItem ? (
          <Grid
            item
            sm={2}
            xs={12}
            style={{
              borderRight: '0.5px #707070 solid',
            }}
          />
        ) : null}

        {children}
      </Grid>
      <CssBaseline />
      <Notifier />
      <Confirm />
    </MuiThemeProvider>
  );
}

function withLayout(BaseComponent, { teamRequired = true } = {}) {
  type MyProps = { pageContext: object; store: Store; teamSlug: string; firstGridItem: boolean };
  type MyState = { isTL: boolean };

  class App extends React.Component<MyProps, MyState> {
    public static defaultProps: { pageContext: null };

    public static async getInitialProps(ctx) {
      const { query, req, pathname } = ctx;

      let baseComponentProps = {};
      let teamSlug = '';
      let firstGridItem = true;

      const { discussionSlug } = query;

      if (BaseComponent.getInitialProps) {
        baseComponentProps = await BaseComponent.getInitialProps(ctx);
      }

      if (teamRequired) {
        teamSlug = query.teamSlug;
      }

      if (pathname.includes('/login') || pathname.includes('/invitation')) {
        firstGridItem = false;
      }

      return {
        ...baseComponentProps,
        teamSlug,
        discussionSlug,
        isServer: !!req,
        firstGridItem,
      };
    }

    private pageContext = null;

    constructor(props, context) {
      super(props, context);
      this.pageContext = this.props.pageContext || getContext();

      const { currentTeam, currentUser } = props.store;
      this.state = {
        isTL: (currentUser && currentTeam && currentUser._id === currentTeam.teamLeaderId) || false,
      };
    }

    public componentDidMount() {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }

      if (teamRequired) {
        this.checkTeam();
      }
    }

    public componentDidUpdate() {
      if (teamRequired) {
        this.checkTeam();
      }
    }

    public render() {
      // Add teamRequired: false to some pages that don't require team

      const { store, firstGridItem } = this.props;
      const { currentTeam, currentUser } = store;

      if (store.isLoggingIn) {
        return (
          <ThemeWrapper pageContext={this.pageContext} firstGridItem={firstGridItem}>
            <Grid item sm={10} xs={12}>
              <Loading text="loading User ..." />
            </Grid>
          </ThemeWrapper>
        );
      }

      if (!currentUser) {
        return (
          <ThemeWrapper pageContext={this.pageContext} firstGridItem={firstGridItem}>
            <Grid item sm={12} xs={12}>
              <BaseComponent {...this.props} />
            </Grid>
          </ThemeWrapper>
        );
      }

      if (store.isLoadingTeams || !store.isInitialTeamsLoaded) {
        return (
          <ThemeWrapper pageContext={this.pageContext} firstGridItem={firstGridItem}>
            <Grid item sm={10} xs={12}>
              <Loading text="loading Teams ..." />
            </Grid>
          </ThemeWrapper>
        );
      }

      if (!currentTeam) {
        if (teamRequired) {
          return (
            <ThemeWrapper pageContext={this.pageContext} firstGridItem={firstGridItem}>
              <Grid item sm={10} xs={12}>
                <div style={styleNoTeamDiv}>Select existing team or create a new team.</div>
              </Grid>
            </ThemeWrapper>
          );
        } else {
          return (
            <ThemeWrapper pageContext={this.pageContext} firstGridItem={firstGridItem}>
              <Grid item sm={10} xs={12}>
                <BaseComponent isTL={this.state.isTL} {...this.props} />
              </Grid>
            </ThemeWrapper>
          );
        }
      }

      return (
        <ThemeWrapper pageContext={this.pageContext} firstGridItem={firstGridItem}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            style={styleGrid}
          >
            {firstGridItem ? (
              <Grid
                item
                sm={2}
                xs={12}
                style={{
                  borderRight: '0.5px #707070 solid',
                }}
              >
                <MenuWithLinks
                  options={getTeamOptionsMenuWithLinksLeft(store.teams).concat(
                    this.state.isTL
                      ? menuUnderTeamListLeftTL(currentTeam)
                      : menuUnderTeamListLeft(),
                  )}
                >
                  <Avatar
                    src={
                      !currentTeam
                        ? 'https://storage.googleapis.com/async-await/async-logo-40.svg'
                        : currentTeam.avatarUrl
                    }
                    alt={`Logo of ${currentTeam.name}`}
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
                <MenuWithLinks options={menuUnderTeamListRight()}>
                  <Avatar
                    src={
                      !currentTeam
                        ? 'https://storage.googleapis.com/async-await/default-user.png'
                        : currentUser.avatarUrl
                    }
                    alt={`Logo of ${currentUser.displayName}`}
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
                <p />
                <p />
                <DiscussionList store={store} team={currentTeam} />
              </Grid>
            ) : null}
            <Grid item sm={10} xs={12}>
              <BaseComponent isTL={this.state.isTL} {...this.props} />
            </Grid>
          </Grid>
        </ThemeWrapper>
      );
    }

    private checkTeam() {
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
  }

  return observer(App);
}

export default withLayout;
