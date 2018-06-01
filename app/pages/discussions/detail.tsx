import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
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

@observer
class Discussion extends React.Component<{
  store: Store;
  teamSlug: string;
  topicSlug: string;
  discussionSlug: string;
  isServer: boolean;
}> {
  state = {
    drawerState: false,
    isEditing: false,
    selectedPost: null,
  };

  static getInitialProps(ctx) {
    const { teamSlug, topicSlug, discussionSlug } = ctx.query;

    return { teamSlug, topicSlug, discussionSlug, isServer: !!ctx.req };
  }

  componentDidMount() {
    this.changeDiscussion(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.changeDiscussion(nextProps);
  }

  changeDiscussion(props) {
    const { teamSlug, topicSlug, discussionSlug, store } = props;
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
    const { store, isServer } = this.props;
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

    if (!currentDiscussion.isInitialPostsLoaded) {
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

    if (!isServer) {
      NProgress.done();
    }

    return (
      <div style={{ height: '100%' }}>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList />
          </Grid>

          <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
            <Button
              onClick={this.showFormToAddNewPost}
              variant="outlined"
              color="primary"
              style={{ float: 'right' }}
            >
              Add new post
            </Button>{' '}
            {currentDiscussion.posts.length > 0 ? (
              <div>
                <h3>{currentDiscussion.name}</h3>
                {currentDiscussion.posts.map(p => (
                  <PostDetail key={p._id} post={p} onEditClick={this.onEditClickCallback} />
                ))}
              </div>
            ) : (
              <div>
                <p> Empty discussion </p>
              </div>
            )}
            <br />
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
