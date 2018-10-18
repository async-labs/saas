import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { observer } from 'mobx-react';
import Link from 'next/link';
import { SingletonRouter, withRouter } from 'next/router';
import React from 'react';

import { Store } from '../../lib/store';

import Confirm from '../common/Confirm';
import Loading from '../common/Loading';
import MenuWithLinks from '../common/MenuWithLinks';
import Notifier from '../common/Notifier';
import DiscussionList from '../discussions/DiscussionList';

import { getTeamOptionsMenuWithLinksLeft, menuUnderTeamListRight } from './menus';

const styleGrid = {
  width: '100vw',
  minHeight: '100vh',
  maxWidth: '100%',
  padding: '0px 10px',
};

const styleNoTeamDiv = {
  padding: '20px',
};

function ThemeWrapper({ children, firstGridItem }) {
  return (
    <React.Fragment>
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
      <Notifier />
      <Confirm />
    </React.Fragment>
  );
}

type MyProps = {
  teamSlug: string;
  firstGridItem: boolean;
  children: React.ReactNode;
  teamRequired: boolean;
  store?: Store;
  router?: SingletonRouter;
};

class Layout extends React.Component<MyProps> {
  public componentDidMount() {
    if (this.props.teamRequired) {
      this.checkTeam();
    }
  }

  public componentDidUpdate() {
    if (this.props.teamRequired) {
      this.checkTeam();
    }
  }

  public render() {
    // Add teamRequired: false to some pages that don't require team

    const { store, firstGridItem, children, teamRequired } = this.props;
    const { currentTeam, currentUser } = store;

    if (store.isLoggingIn) {
      return (
        <ThemeWrapper firstGridItem={firstGridItem}>
          <Grid item sm={10} xs={12}>
            <Loading text="loading User ..." />
          </Grid>
        </ThemeWrapper>
      );
    }

    if (!currentUser) {
      return (
        <ThemeWrapper firstGridItem={firstGridItem}>
          <Grid item sm={12} xs={12}>
            {children}
          </Grid>
        </ThemeWrapper>
      );
    }

    if (store.isLoadingTeams || !store.isInitialTeamsLoaded) {
      return (
        <ThemeWrapper firstGridItem={firstGridItem}>
          <Grid item sm={10} xs={12}>
            <Loading text="loading Teams ..." />
          </Grid>
        </ThemeWrapper>
      );
    }

    if (!currentTeam) {
      if (teamRequired) {
        return (
          <ThemeWrapper firstGridItem={false}>
            <Grid item sm={10} xs={12}>
              <div style={styleNoTeamDiv}>
                Select existing team or create a new team.
                <p />
                <Link prefetch href="/create-team">
                  <Button variant="outlined" color="primary">
                    Create new team
                  </Button>
                </Link>
              </div>
            </Grid>
          </ThemeWrapper>
        );
      } else {
        return (
          <ThemeWrapper firstGridItem={firstGridItem}>
            <Grid item sm={10} xs={12}>
              {children}
            </Grid>
          </ThemeWrapper>
        );
      }
    }

    return (
      <ThemeWrapper firstGridItem={firstGridItem}>
        <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
          {firstGridItem ? (
            <Grid
              item
              sm={2}
              xs={12}
              style={{
                borderRight: '0.5px #707070 solid',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0px 10px' }}>
                <MenuWithLinks
                  options={getTeamOptionsMenuWithLinksLeft({
                    teams: store.teams,
                    currentTeam,
                    currentUserId: currentUser._id,
                  })}
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
                      width: '40px',
                      height: '40px',
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
                      width: '40px',
                      height: '40px',
                    }}
                  />

                  <i className="material-icons" color="action" style={{ verticalAlign: 'super' }}>
                    arrow_drop_down
                  </i>
                </MenuWithLinks>
              </div>
              <hr />
              <p />
              <p />
              <DiscussionList store={store} team={currentTeam} />
            </Grid>
          ) : null}
          <Grid item sm={10} xs={12}>
            {children}
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
    }
  }
}

export default withRouter(observer(Layout));
