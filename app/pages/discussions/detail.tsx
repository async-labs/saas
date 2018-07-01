import * as React from 'react';
import Head from 'next/head';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';

import { observer } from 'mobx-react';
import NProgress from 'nprogress';

import withLayout from '../../lib/withLayout';
import withAuth from '../../lib/withAuth';
import { Store } from '../../lib/store';
import DiscussionList from '../../components/discussions/DiscussionList';
import PostForm from '../../components/posts/PostForm';
import PostDetail from '../../components/posts/PostDetail';

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

type Props = {
  store: Store;
  teamSlug: string;
  topicSlug: string;
  discussionSlug: string;
  isServer: boolean;
}

class Discussion extends React.Component<Props> {
  state = {
    drawerState: false,
    selectedPost: null,
  };

  componentDidMount() {
    this.changeDiscussion(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.changeDiscussion(nextProps);
  }

  changeDiscussion(props: Props) {
    const { teamSlug, discussionSlug, topicSlug, store } = props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== teamSlug) {
      return;
    }

    const { currentTopic } = store.currentTeam;

    console.log(`Team: ${currentTeam.slug}`);

    if (!currentTopic || currentTopic.slug !== topicSlug) {
      currentTeam.setCurrentTopicAndDiscussion({ topicSlug, discussionSlug });
    } else if (currentTopic.currentDiscussionSlug !== discussionSlug) {
      currentTopic.setCurrentDiscussion(discussionSlug);
    }
  }

  showFormToAddNewPost = () => {
    this.setState({ drawerState: true, selectedPost: null });
  };

  onEditClickCallback = post => {
    this.setState({ selectedPost: post, drawerState: true });
    console.log(`Page: ${this.state.selectedPost}`);
  };

  render() {
    const { store, isServer } = this.props;
    const { currentTeam } = store;
    const { selectedPost, drawerState } = this.state;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div style={styleLoadingDiv}>Create new team or select existing team.</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div style={styleLoadingDiv}>loading Topics ...</div>;
    }

    const { currentTopic } = store.currentTeam;

    if (!currentTopic) {
      return (
        <Grid
          container
          style={styleGrid}
          direction="row"
          justify="flex-start"
          alignItems="stretch"
        >
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <div style={styleLoadingDiv}>No Topic is found.</div>
          </Grid>

          <Grid item sm={10} xs={12}>
            <div style={styleLoadingDiv}>Select or create topic.</div>
          </Grid>
        </Grid>
      );
    }

    if (!isServer) {
      NProgress.start();
    }

    if (!currentTopic.isInitialDiscussionsLoaded) {
      return (
        <Grid container style={styleGrid} direction="row" justify="flex-start" alignItems="stretch">
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
          </Grid>

          <Grid item sm={10} xs={12} style={styleGridItem}>
            <div style={styleLoadingDiv}>loading Discussions ...</div>
          </Grid>
        </Grid>
      );
    }

    const { currentDiscussion } = currentTopic;

    if (!currentDiscussion) {
      return (
        <Grid container style={styleGrid} direction="row" justify="flex-start" alignItems="stretch">
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
          </Grid>

          <Grid item sm={10} xs={12} style={styleGridItem}>
            <div style={styleLoadingDiv}>Empty topic.</div>
          </Grid>
        </Grid>
      );
    }

    if (!currentDiscussion.isInitialPostsLoaded) {
      return (
        <Grid container style={styleGrid} direction="row" justify="flex-start" alignItems="stretch">
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
          </Grid>
          <Grid item sm={10} xs={12} style={styleGridItem}>
            <div style={styleLoadingDiv}>loading Posts ...</div>
          </Grid>
        </Grid>
      );
    }

    if (!isServer) {
      NProgress.done();
    }

    return (
      <div style={{ height: '100%' }}>
        <Head>
          <title>Discussion: {currentDiscussion.name}</title>
          <meta
            name="description"
            content={`Discussion ${currentDiscussion.name} in Topic ${currentTopic.name} by Team ${
              currentTeam.name
            }`}
          />
        </Head>
        <Grid container style={styleGrid} direction="row" justify="flex-start" alignItems="stretch">
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <DiscussionList topic={currentTopic} />
          </Grid>
          <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
            {currentDiscussion.posts.length > 0 ? (
              <div>
                <h3 style={{ marginRight: 10, display: 'inline-flex', verticalAlign: 'middle' }}>
                  {currentDiscussion.name}
                </h3>
                {Array.from(currentTeam.members.values()).map(m => (
                  <Tooltip
                    title={m.displayName}
                    placement="top"
                    disableFocusListener
                    disableTouchListener
                    key={m._id}
                  >
                    <Avatar
                      role="presentation"
                      src={m.avatarUrl}
                      alt={m.avatarUrl}
                      key={m._id}
                      style={{
                        margin: '0px 5px',
                        display: 'inline-flex',
                        width: '30px',
                        height: '30px',
                        verticalAlign: 'middle',
                      }}
                    />
                  </Tooltip>
                ))}
                <br />
                {currentDiscussion.posts.map(p => (
                  <PostDetail key={p._id} post={p} onEditClick={this.onEditClickCallback} />
                ))}
                <br />
                <Button
                  onClick={this.showFormToAddNewPost}
                  variant="outlined"
                  color="primary"
                  style={{ verticalAlign: 'baseline' }}
                >
                  Add new post
                </Button>
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
              onFinished={() => {
                this.setState({ drawerState: false, selectedPost: null });
              }}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(observer(Discussion)));
