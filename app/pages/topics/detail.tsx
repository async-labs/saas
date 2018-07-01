import * as React from 'react';
import Head from 'next/head';
import Grid from '@material-ui/core/Grid';
import Router from 'next/router';
import { observer } from 'mobx-react';

import DiscussionList from '../../components/discussions/DiscussionList';
import withLayout from '../../lib/withLayout';
import withAuth from '../../lib/withAuth';
import { Store } from '../../lib/store';

const styleGrid = {
  width: '100vw',
  maxWidth: '100%',
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

const styleLoadingDiv = {
  padding: '20px',
};

class Topic extends React.Component<{
  teamSlug: string;
  topicSlug: string;
  isServer: boolean;
  store: Store;
}> {
  componentDidMount() {
    this.changeTopic();
  }

  componentDidUpdate() {
    this.changeTopic();
  }

  changeTopic() {
    const { teamSlug, topicSlug, store } = this.props;
    const { currentTeam } = store;

    if (currentTeam.slug !== teamSlug) {
      store.setCurrentTeam(teamSlug);
      return;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return;
    }

    const { currentTopic } = currentTeam;

    if (!currentTopic || currentTopic.slug !== topicSlug) {
      currentTeam.setCurrentTopic(topicSlug);
      return;
    }

    const { currentDiscussion } = currentTopic;

    if (currentDiscussion) {
      Router.push(
        `/discussions/detail?teamSlug=${teamSlug}&topicSlug=${topicSlug}&discussionSlug=${
          currentDiscussion.slug
        }`,
        `/team/${teamSlug}/t/${currentTopic.slug}/d/${currentDiscussion.slug}`,
      );
    }
  }

  render() {
    const { store } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div style={styleLoadingDiv}>You have not selected Team.</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div style={styleLoadingDiv}>loading Topics ...</div>;
    }

    const { currentTopic } = store.currentTeam;

    if (!currentTopic) {
      return (
        <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <div style={styleLoadingDiv}>No topic is found.</div>
          </Grid>

          <Grid item sm={10} xs={12} style={styleGrid}>
            <div style={styleLoadingDiv}>Select or create topic.</div>
          </Grid>
        </Grid>
      );
    }

    if (!currentTopic.isInitialDiscussionsLoaded) {
      return (
        <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
          </Grid>

          <Grid item sm={10} xs={12} style={styleGrid}>
            <div style={styleLoadingDiv}>loading Discussions ...</div>
          </Grid>
        </Grid>
      );
    }

    const { currentDiscussion } = currentTopic;

    if (!currentDiscussion) {
      return (
        <div style={{ height: '100%' }}>
          <Head>
            <title>{currentTopic.name}</title>
            <meta name="description" content={`${currentTopic.name} by Team ${currentTeam.name}`} />
          </Head>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            style={styleGrid}
          >
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <DiscussionList topic={currentTopic} />
            </Grid>
            <Grid item sm={10} xs={12} style={styleGridItem}>
              <div style={styleLoadingDiv}>No discussion is found.</div>
            </Grid>
          </Grid>
        </div>
      );
    }

    return (
      <div style={{ height: '100%' }}>
        <Head>
          <title>{currentTopic.name}</title>
          <meta name="description" content={`${currentTopic.name} by Team ${currentTeam.name}`} />
        </Head>
        <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
          </Grid>
          <Grid item sm={10} xs={12} style={styleGridItem}>
            <div style={styleLoadingDiv}>loading {currentDiscussion.name} ...</div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(observer(Topic)));
