import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Head from 'next/head';
import Router from 'next/router';
import * as React from 'react';

import { observer } from 'mobx-react';

import Loading from '../components/common/Loading';
import Layout from '../components/layout';
import PostDetail from '../components/posts/PostDetail';
import PostForm from '../components/posts/PostForm';
import { Discussion, Store } from '../lib/store';
import withAuth from '../lib/withAuth';

const styleGridItem = {
  padding: '10px 20px',
};

type Props = {
  store: Store;
  teamSlug: string;
  discussionSlug: string;
  isServer: boolean;
  isMobile: boolean;
};

class DiscussionComp extends React.Component<Props> {
  public state = {
    drawerState: false,
    selectedPost: null,
  };

  public componentDidMount() {
    this.changeDiscussion();
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.discussionSlug !== this.props.discussionSlug) {
      this.changeDiscussion();
    }
  }

  public getDiscussion(slug: string): Discussion {
    const { store, teamSlug } = this.props;
    const { currentTeam } = store;

    if (!slug && currentTeam.discussions.length > 0) {
      Router.replace(
        `/discussion?teamSlug=${teamSlug}&discussionSlug=${currentTeam.orderedDiscussions[0].slug}`,
        `/team/${teamSlug}/discussions/${currentTeam.orderedDiscussions[0].slug}`,
      );
      return;
    }

    if (slug && store.currentTeam) {
      return store.currentTeam.getDiscussionBySlug(slug);
    }

    return null;
  }

  public changeDiscussion() {
    const { teamSlug, discussionSlug, store, isServer } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== teamSlug) {
      return;
    }

    if (!discussionSlug && currentTeam.discussions.length > 0) {
      Router.replace(
        `/discussion?teamSlug=${teamSlug}&discussionSlug=${currentTeam.orderedDiscussions[0].slug}`,
        `/team/${teamSlug}/discussions/${currentTeam.orderedDiscussions[0].slug}`,
      );

      return;
    }

    const discussion = this.getDiscussion(discussionSlug);

    if (!isServer && discussion) {
      discussion.loadPosts().catch(e => console.error(e));
    }
  }

  public showFormToAddNewPost = () => {
    this.setState({ drawerState: true, selectedPost: null });
  };

  public onEditClickCallback = post => {
    this.setState({ selectedPost: post, drawerState: true });
    console.log(`Page: ${this.state.selectedPost}`);
  };

  public renderPosts() {
    const { isServer } = this.props;

    const discussion = this.getDiscussion(this.props.discussionSlug);

    if (discussion && discussion.isLoadingPosts && discussion.posts.length === 0) {
      return <p>Empty discussion</p>;
    }

    let loading = 'loading Posts ...';
    if (discussion && discussion.posts.length > 0) {
      loading = 'checking for newer Posts ...';
    }

    return (
      <React.Fragment>
        {discussion
          ? discussion.posts.map(p => (
              <PostDetail
                key={p._id}
                post={p}
                onEditClick={this.onEditClickCallback}
                isMobile={this.props.isMobile}
              />
            ))
          : null}

        {discussion && discussion.isLoadingPosts && !isServer ? (
          <Loading text={loading} />
        ) : (
          <p style={{ height: '1.0em' }} />
        )}
      </React.Fragment>
    );
  }

  public render() {
    const { store, discussionSlug } = this.props;
    const { currentTeam } = store;
    const { selectedPost, drawerState } = this.state;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
          <div style={styleGridItem}>No Team is found.</div>
        </Layout>
      );
    }

    const discussion = this.getDiscussion(discussionSlug);

    if (!discussion) {
      if (currentTeam.isLoadingDiscussions) {
        return (
          <Layout {...this.props}>
            <div style={styleGridItem}>
              <Loading text="loading Discussions ..." />
            </div>
          </Layout>
        );
      } else {
        return (
          <Layout {...this.props}>
            <Head>
              <title>No discussion is found.</title>
            </Head>
            <div style={styleGridItem}>
              <p>No discussion is found.</p>
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
        <div style={{ height: '100%', padding: '0px 20px' }}>
          <h4>
            <span style={{ fontWeight: 300 }}>Discussion : </span>
            {(discussion && discussion.name) || 'No Discussion is found.'}
          </h4>{' '}
          Visible to :{' '}
          {discussion
            ? discussion.members.map(m => (
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
          <Button
            onClick={this.showFormToAddNewPost}
            variant="outlined"
            color="primary"
            style={{ verticalAlign: 'baseline' }}
          >
            Add new post
          </Button>
          <p />
          <br />
          <PostForm
            discussion={discussion}
            post={selectedPost}
            open={drawerState}
            members={discussion.members}
            onFinished={() => {
              this.setState({ drawerState: false });

              setTimeout(() => {
                this.setState({
                  selectedPost: null,
                });
              }, 500);
            }}
          />
        </div>
      </Layout>
    );
  }
}

export default withAuth(observer(DiscussionComp));
