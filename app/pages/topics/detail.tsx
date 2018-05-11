import * as React from 'react';
import Grid from 'material-ui/Grid';
import { observer } from 'mobx-react';
import Router from 'next/router';

import DiscussionList from '../../components/discussions/DiscussionList';
import withLayout from '../../lib/withLayout';
import withAuth from '../../lib/withAuth';
import { getStore } from '../../lib/store';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

const store = getStore();

@observer
class Topic extends React.Component<{ teamSlug: string; topicSlug: string }> {
  static async getInitialProps({ query }) {
    const { teamSlug, topicSlug } = query;

    return { teamSlug, topicSlug };
  }

  componentDidMount() {
    this.changeTopic();
  }

  componentDidUpdate() {
    this.changeTopic();
  }

  changeTopic() {
    const { teamSlug, topicSlug } = this.props;
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
      store.currentTeam.setCurrentTopic(topicSlug);
      return;
    }

    store.deleteNotification({ topicId: currentTopic._id });

    const { currentDiscussion } = currentTopic;
    if (currentDiscussion) {
      Router.push(
        `/discussions/detail?teamSlug=${teamSlug}&topicSlug=${topicSlug}&discussionSlug=${
          currentDiscussion.slug
        }`,
        `/team/${teamSlug}/t/${currentTopic.slug}/${currentDiscussion.slug}`,
      );
    }
  }

  render() {
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div>Team is not selected</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div>loading...</div>;
    }

    const { currentTopic } = store.currentTeam;

    if (!currentTopic) {
      return (
        <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <h2>No topic</h2>
          </Grid>

          <Grid item sm={10} xs={12}>
            <p>Select or add topic.</p>
          </Grid>
        </Grid>
      );
    }

    if (!currentTopic.isInitialDiscussionsLoaded) {
      return (
        <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList />
          </Grid>

          <Grid item sm={10} xs={12}>
            <div>loading...</div>
          </Grid>
        </Grid>
      );
    }

    const { currentDiscussion } = currentTopic;

    if (!currentDiscussion) {
      return (
        <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList />
          </Grid>

          <Grid item sm={10} xs={12}>
            <div>No discussions found</div>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container direction="row" justify="flex-start" alignItems="stretch" style={styleGrid}>
        <Grid item sm={2} xs={12} style={styleGridItem}>
          <DiscussionList />
        </Grid>

        <Grid item sm={10} xs={12}>
          <div>loading...</div>
        </Grid>
      </Grid>
    );
  }
}

export default withAuth(withLayout(Topic));
