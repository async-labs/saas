import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Head from 'next/head';
import Router from 'next/router';
import * as React from 'react';

import { observer } from 'mobx-react';

import Layout from '../components/layout';
import PostDetail from '../components/posts/PostDetail';
import PostForm from '../components/posts/PostForm';
import notify from '../lib/notify';
import { Store } from '../lib/store';
import { Discussion } from '../lib/store/discussion';
import withAuth from '../lib/withAuth';
import { Post } from 'lib/store/post';

type Props = {
  store: Store;
  teamSlug: string;
  discussionSlug: string;
  isServer: boolean;
  isMobile: boolean;
};

type State = {
  selectedPost: Post;
  showMarkdownClicked: boolean;
};

class DiscussionPageComp extends React.Component<Props, State> {
  public state = {
    selectedPost: null,
    showMarkdownClicked: false,
  };

  public render() {
    const { store, isMobile, discussionSlug } = this.props;
    const { currentTeam } = store;
    const { selectedPost } = this.state;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
          <Head>
            <title>No Team is found.</title>
          </Head>
          <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>No Team is found.</div>
        </Layout>
      );
    }

    const discussion = this.getDiscussion(discussionSlug);

    if (!discussion) {
      if (currentTeam.isLoadingDiscussions) {
        return (
          <Layout {...this.props}>
            <Head>
              <title>Loading...</title>
            </Head>
            <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
              <p>Loading Discussions...</p>
            </div>
          </Layout>
        );
      } else {
        return (
          <Layout {...this.props}>
            <Head>
              <title>No Discussion is found.</title>
            </Head>
            <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
              <p>No Discussion is found.</p>
            </div>
          </Layout>
        );
      }
    }

    const title = discussion ? `${discussion.name} · Discussion` : 'Discussions';

    return (
      <Layout {...this.props}>
        <Head>
          <title>{title}</title>
          <meta
            name="description"
            content={
              discussion
                ? `Discussion ${discussion.name} by Team ${currentTeam.name}`
                : 'Discussions'
            }
          />
        </Head>
        <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
          <h4>
            <span style={{ fontWeight: 300 }}>Discussion : </span>
            {(discussion && discussion.name) || 'No Discussion is found.'}
          </h4>{' '}
          Visible to :{' '}
          {discussion
            ? discussion.members.map((m) => (
                <Tooltip
                  title={m.displayName}
                  placement="right"
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
              ))
            : null}
          <p />
          {this.renderPosts()}
          {discussion && !discussion.isLoadingPosts ? (
            <React.Fragment>
              {selectedPost ? null : (
                <PostForm
                  post={null}
                  discussion={discussion}
                  members={discussion.members}
                  isMobile={this.props.isMobile}
                  store={store}
                />
              )}
            </React.Fragment>
          ) : null}
          <p />
          <br />
        </div>
      </Layout>
    );
  }

  public getDiscussion(slug: string): Discussion {
    const { store, teamSlug } = this.props;
    const { currentTeam } = store;

    if (!currentTeam) {
      return;
    }

    if (!slug && currentTeam.discussions.length > 0) {
      Router.replace(
        `/discussion?teamSlug=${teamSlug}&discussionSlug=${currentTeam.orderedDiscussions[0].slug}`,
        `/team/${teamSlug}/discussions/${currentTeam.orderedDiscussions[0].slug}`,
      );
      return;
    }

    if (slug && currentTeam) {
      return currentTeam.getDiscussionBySlug(slug);
    }

    return null;
  }

  public renderPosts() {
    const { isServer, store, isMobile } = this.props;
    const { selectedPost, showMarkdownClicked } = this.state;
    const discussion = this.getDiscussion(this.props.discussionSlug);

    if (!discussion.isLoadingPosts && discussion.posts.length === 0) {
      return <p>Empty Discussion.</p>;
    }

    let loading = 'loading Posts ...';
    if (discussion.posts.length > 0) {
      loading = 'checking for newer Posts ...';
    }

    return (
      <React.Fragment>
        {discussion
          ? discussion.posts.map((p) =>
              selectedPost && selectedPost._id === p._id ? (
                <PostForm
                  store={store}
                  isMobile={isMobile}
                  key={p._id}
                  post={p}
                  showMarkdownToNonCreator={showMarkdownClicked}
                  discussion={discussion}
                  members={discussion.members}
                  onFinished={() => {
                    this.setState({
                      selectedPost: null,
                      showMarkdownClicked: false,
                    });
                  }}
                />
              ) : (
                <PostDetail
                  key={p._id}
                  post={p}
                  onEditClick={this.onEditClickCallback}
                  onShowMarkdownClick={this.onSnowMarkdownClickCallback}
                  isMobile={this.props.isMobile}
                  store={store}
                />
              ),
            )
          : null}

        {discussion && discussion.isLoadingPosts && !isServer ? <p>{loading}</p> : null}
      </React.Fragment>
    );
  }

  public onEditClickCallback = (post) => {
    this.setState({ selectedPost: post, showMarkdownClicked: false });
  };

  public onSnowMarkdownClickCallback = (post) => {
    this.setState({ selectedPost: post, showMarkdownClicked: true });
  };

  public componentDidMount() {
    const { discussionSlug, store, isServer } = this.props;

    if (store.currentTeam && (!isServer || !discussionSlug)) {
      store.currentTeam.loadDiscussions().catch((err) => notify(err));
    }

    const discussion = this.getDiscussion(discussionSlug);

    if (discussion) {
      discussion.joinSocketRooms();
    }

    console.log(store.socket);

    store.socket.on('discussionEvent', this.handleDiscussionEvent);
    store.socket.on('postEvent', this.handlePostEvent);
    store.socket.on('reconnect', this.handleSocketReconnect);
  }

  public componentWillUnmount() {
    const { discussionSlug, store } = this.props;

    const discussion = this.getDiscussion(discussionSlug);

    if (discussion) {
      discussion.leaveSocketRooms();
    }

    store.socket.off('discussionEvent', this.handleDiscussionEvent);
    store.socket.off('postEvent', this.handlePostEvent);
    store.socket.off('reconnect', this.handleSocketReconnect);
  }

  public componentDidUpdate(prevProps: Props) {
    const { discussionSlug, isServer } = this.props;

    if (prevProps.discussionSlug !== discussionSlug) {
      if (prevProps.discussionSlug) {
        const prevDiscussion = this.getDiscussion(prevProps.discussionSlug);
        if (prevDiscussion) {
          prevDiscussion.leaveSocketRooms();
        }
      }

      const discussion = this.getDiscussion(discussionSlug);

      if (!isServer && discussion) {
        discussion.loadPosts().catch((err) => notify(err));
      }

      if (discussion) {
        discussion.joinSocketRooms();
      }
    }
  }

  private handleDiscussionEvent = (data) => {
    console.log('discussion realtime event', data);

    const discussion = this.getDiscussion(this.props.discussionSlug);
    if (discussion) {
      discussion.handleDiscussionRealtimeEvent(data);
    }
  };

  private handlePostEvent = (data) => {
    console.log('post realtime event', data);

    const discussion = this.getDiscussion(this.props.discussionSlug);
    if (discussion) {
      discussion.handlePostRealtimeEvent(data);
    }
  };

  private handleSocketReconnect = () => {
    console.log('pages/discussion.tsx: socket re-connected');

    const discussion = this.getDiscussion(this.props.discussionSlug);
    if (discussion) {
      discussion.loadPosts().catch((err) => notify(err));
      discussion.joinSocketRooms();
    }
  };
}

export default withAuth(observer(DiscussionPageComp));
