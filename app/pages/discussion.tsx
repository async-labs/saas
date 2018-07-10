import * as React from 'react';
import Head from 'next/head';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Router from 'next/router';

import { observer } from 'mobx-react';

import withLayout from '../lib/withLayout';
import withAuth from '../lib/withAuth';
import { Store } from '../lib/store';
import PostForm from '../components/posts/PostForm';
import PostDetail from '../components/posts/PostDetail';
import Loading from '../components/common/Loading';

const styleGridItem = {
  padding: '10px 20px',
};

type Props = {
  store: Store;
  teamSlug: string;
  discussionSlug: string;
  isServer: boolean;
};

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
    const { teamSlug, discussionSlug, store } = props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== teamSlug) {
      return;
    }

    if (!discussionSlug && currentTeam.currentDiscussionSlug) {
      Router.push(
        `/discussion?teamSlug=${teamSlug}&discussionSlug=${currentTeam.currentDiscussionSlug}`,
        `/team/${teamSlug}/d/${currentTeam.currentDiscussionSlug}`,
      );

      return;
    }

    currentTeam.setCurrentDiscussion({ slug: discussionSlug });

    if (currentTeam && currentTeam.currentDiscussion) {
      if (!props.isServer) {
        currentTeam.currentDiscussion.loadPosts();
      }
    }

  }

  showFormToAddNewPost = () => {
    this.setState({ drawerState: true, selectedPost: null });
  };

  onEditClickCallback = post => {
    this.setState({ selectedPost: post, drawerState: true });
    console.log(`Page: ${this.state.selectedPost}`);
  };

  renderPosts() {
    const { store, isServer } = this.props;
    const { currentTeam } = store;

    const { currentDiscussion } = currentTeam;

    if (currentDiscussion.isLoadingPosts && currentDiscussion.posts.length === 0) {
      return <p>Empty discussion</p>;
    }

    let loading = 'loading Posts ...';
    if (currentDiscussion.posts.length > 0) {
      loading = 'checking for newer Posts ...';
    }

    return (
      <React.Fragment>
        {currentDiscussion.posts.map(p => (
          <PostDetail key={p._id} post={p} onEditClick={this.onEditClickCallback} />
        ))}

        {currentDiscussion.isLoadingPosts && !isServer ? (
          <Loading text={loading} />
        ) : (
          <p style={{ height: '1.0em' }} />
        )}
      </React.Fragment>
    );
  }

  render() {
    const { store } = this.props;
    const { currentTeam } = store;
    const { selectedPost, drawerState } = this.state;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div style={styleGridItem}>No Team is found.</div>;
    }

    const { currentDiscussion } = currentTeam;

    if (!currentDiscussion && !currentTeam.isLoadingDiscussions) {
      if (currentTeam.isLoadingDiscussions) {
        return (
          <div style={styleGridItem}>
            <Loading text="loading Discussions ..." />
          </div>
        );
      } else {
        return <div style={styleGridItem}>No discussion is found.</div>;
      }
    }

    // if (currentTeam.isLoadingDiscussions) {
    //   return (
    //     <div style={styleGridItem}>
    //       <Loading text="loading Discussions ..." />
    //     </div>
    //   );
    // }

    // if (!currentDiscussion) {
    //   return <div style={styleGridItem}>No discussion is found.</div>;
    // }

    return (
      <div style={{ height: '100%' }}>
        <Head>
          <title>{currentDiscussion.name}</title>
          <meta
            name="description"
            content={`Discussion ${currentDiscussion.name} by Team ${currentTeam.name}`}
          />
        </Head>
        <h4 style={{ marginBottom: '1em' }}>{currentDiscussion.name}</h4>
        {currentDiscussion.members.map(m => (
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
        ))}
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
          post={selectedPost}
          open={drawerState}
          members={currentDiscussion.members}
          onFinished={() => {
            this.setState({ drawerState: false, selectedPost: null });
          }}
        />
      </div>
    );
  }
}

export default withAuth(withLayout(observer(Discussion)));
