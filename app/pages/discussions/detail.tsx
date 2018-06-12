import * as React from 'react';
import { Button, Grid } from '@material-ui/core';
import { observer } from 'mobx-react';
import NProgress from 'nprogress';

import withLayout from '../../lib/withLayout';
import withAuth from '../../lib/withAuth';
import { Store } from '../../lib/store';
import DiscussionList from '../../components/discussions/DiscussionList';
import PostForm from '../../components/posts/PostForm';
import PostDetail from '../../components/posts/PostDetail';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

interface Props {
  store: Store;
  teamSlug: string;
  topicSlug: string;
  discussionSlug: string;
  isServer: boolean;
}

@observer
class Discussion extends React.Component<Props> {
  state = {
    drawerState: false,
    isEditing: false,
    selectedPost: null,
  };

  componentDidMount() {
    this.changeDiscussion(this.props);
  }

  componentWillUnmount() {
    const { store } = this.props;

    const { currentTopic } = store.currentTeam;

    if (currentTopic) {
      currentTopic.leaveSocketRoom();
    }

    if (currentTopic && currentTopic.currentDiscussion) {
      currentTopic.currentDiscussion.leaveSocketRoom();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.changeDiscussion(nextProps);
  }

  handlePostEvent = data => {
    console.log('post realtime event', data);

    const { store } = this.props;
    const { currentTopic } = store.currentTeam;

    if (currentTopic && currentTopic.currentDiscussion) {
      currentTopic.currentDiscussion.handlePostRealtimeEvent(data);
    }
  };

  changeDiscussion(props: Props) {
    const { teamSlug, topicSlug, discussionSlug, store } = props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== teamSlug) {
      store.setCurrentTeam(teamSlug);
      return;
    }

    const { currentTopic } = store.currentTeam;

    if (!currentTopic || currentTopic.slug !== topicSlug) {
      if (currentTopic) {
        currentTopic.leaveSocketRoom();

        if (currentTopic.currentDiscussion) {
          currentTopic.currentDiscussion.leaveSocketRoom();
        }
      }

      currentTeam.setCurrentTopicAndDiscussion({ topicSlug, discussionSlug });
    } else if (currentTopic.currentDiscussionSlug !== discussionSlug) {
      if (currentTopic.currentDiscussion) {
        currentTopic.currentDiscussion.leaveSocketRoom();
      }

      currentTopic.setCurrentDiscussion(discussionSlug);
    }

    if (currentTopic) {
      currentTopic.joinSocketRoom();

      if (currentTopic.currentDiscussion) {
        currentTopic.currentDiscussion.joinSocketRoom();
      }
    }
  }

  componentDidUpdate() {
    const { store } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return;
    }

    const { currentTopic } = currentTeam;

    if (!currentTopic) {
      return;
    }
  }

  showFormToAddNewPost = () => {
    this.setState({ drawerState: true, isEditing: false });
  };

  onEditClickCallback = post => {
    this.setState({ selectedPost: post, drawerState: true, isEditing: true });
    console.log(`Page: ${this.state.selectedPost}`);
  };

  render() {
    const { store, isServer } = this.props;
    const { currentTeam } = store;
    const { selectedPost, drawerState, isEditing } = this.state;

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
            <div style={{ padding: '0px 0px 0px 20px' }}>Select or add topic.</div>
          </Grid>
        </Grid>
      );
    }

    if (!isServer) {
      NProgress.start();
    }

    if (!currentTopic.isInitialDiscussionsLoaded) {
      return (
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
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
            <DiscussionList topic={currentTopic} />
          </Grid>

          <Grid item sm={10} xs={12}>
            <p>Empty topic.</p>
          </Grid>
        </Grid>
      );
    }

    if (!currentDiscussion.isInitialPostsLoaded) {
      return (
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
          </Grid>
          <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
            <div />
            {/* 2-loading */}
          </Grid>
        </Grid>
      );
    }

    if (!isServer) {
      NProgress.done();
    }

    return (
      <div style={{ height: '100%' }}>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
          </Grid>

          <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
            {currentDiscussion.posts.length > 0 ? (
              <div>
                <h3 style={{ marginRight: 20, display: 'inline-flex' }}>
                  {currentDiscussion.name}
                </h3>
                <Button
                  onClick={this.showFormToAddNewPost}
                  variant="outlined"
                  color="primary"
                  style={{ verticalAlign: 'baseline' }}
                >
                  Add new post
                </Button>
                <br />
                {currentDiscussion.posts.map(p => (
                  <PostDetail key={p._id} post={p} onEditClick={this.onEditClickCallback} />
                ))}
              </div>
            ) : (
              <div>
                <h3 style={{ marginRight: 20, display: 'inline-flex' }}>
                  {currentDiscussion.name}
                </h3>
                <Button
                  onClick={this.showFormToAddNewPost}
                  variant="outlined"
                  color="primary"
                  style={{ verticalAlign: 'baseline' }}
                >
                  Add new post
                </Button>
                <p>Empty discussion</p>
              </div>
            )}

            <PostForm
              post={selectedPost}
              open={drawerState}
              isEditing={isEditing}
              onFinished={() => {
                this.setState({ drawerState: false });
              }}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(Discussion));
