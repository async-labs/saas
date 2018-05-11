import * as React from 'react';
import Grid from 'material-ui/Grid';
import { observer } from 'mobx-react';
import NProgress from 'nprogress';

import withLayout from '../../lib/withLayout';
import withAuth from '../../lib/withAuth';
import { getStore } from '../../lib/store';
import DiscussionList from '../../components/discussions/DiscussionList';
import MessageForm from '../../components/messages/MessageForm';
import MessageDetail from '../../components/messages/MessageDetail';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

const store = getStore();

@observer
class Discussion extends React.Component<{
  teamSlug: string;
  topicSlug: string;
  discussionSlug: string;
}> {
  static async getInitialProps({ query }) {
    const { teamSlug, topicSlug, discussionSlug } = query;

    return { teamSlug, topicSlug, discussionSlug };
  }

  componentDidMount() {
    this.changeDiscussion(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.changeDiscussion(nextProps);
  }

  changeDiscussion(props) {
    const { teamSlug, topicSlug, discussionSlug } = props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== teamSlug) {
      store.setCurrentTeam(teamSlug);
      return;
    }

    const { currentTopic } = store.currentTeam;

    if (!currentTopic || currentTopic.slug !== topicSlug) {
      store.currentTeam.setCurrentTopicAndDiscussion({ topicSlug, discussionSlug });
    } else {
      if (currentTopic.currentDiscussionSlug !== discussionSlug) {
        currentTopic.setCurrentDiscussion(discussionSlug);
      }
    }
  }

  componentDidUpdate() {
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return;
    }

    const { currentTopic } = currentTeam;

    if (!currentTopic) {
      return;
    }

    store.deleteNotification({ topicId: currentTopic._id });
    const { currentDiscussion } = currentTopic;
    if (currentDiscussion) {
      store.deleteNotification({ discussionId: currentDiscussion._id });
    }
  }

  render() {
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div>Team not selected</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div />; // loading
    }

    const { currentTopic } = store.currentTeam;

    if (!currentTopic) {
      return (
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <h2>No topic</h2>
          </Grid>

          <Grid item sm={10} xs={12}>
            <p>Select or add topic.</p>
          </Grid>
        </Grid>
      );
    }

    NProgress.start();

    if (!currentTopic.isInitialDiscussionsLoaded) {
      return (
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList />
          </Grid>

          <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
            <div />
            {/* 1-loading */}
          </Grid>
        </Grid>
      );
    }

    const { currentDiscussion } = currentTopic;

    if (!currentDiscussion) {
      return (
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList />
          </Grid>

          <Grid item sm={10} xs={12}>
            <p>Empty topic.</p>
          </Grid>
        </Grid>
      );
    }

    if (!currentDiscussion.isInitialMessagesLoaded) {
      return (
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList />
          </Grid>
          <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
            <div />
            {/* 2-loading */}
          </Grid>
        </Grid>
      );
    }

    NProgress.done();

    return (
      <Grid container style={styleGrid}>
        <Grid item sm={2} xs={12} style={styleGridItem}>
          <DiscussionList />
        </Grid>

        <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
          {currentDiscussion.messages.length > 0 ? (
            <div>
              <h3>Messages</h3>
              {currentDiscussion.messages.map(m => <MessageDetail key={m._id} message={m} />)}
            </div>
          ) : (
            <p>Empty discussion.</p>
          )}

          <MessageForm />
        </Grid>
      </Grid>
    );
  }
}

export default withAuth(withLayout(Discussion));
