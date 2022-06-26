import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Head from 'next/head';
import Router from 'next/router';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';

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
  firstGridItem: boolean;
  teamRequired: boolean;
};

function DiscussionPageCompFunctional({
  store,
  teamSlug,
  discussionSlug,
  isServer,
  isMobile,
  firstGridItem,
  teamRequired,
}: Props) {
  const [selectedPost, setSelectedPost] = useState<Post>(null);
  const [showMarkdownClicked, setShowMarkdownClicked] = useState<boolean>(false);

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const prevDiscussionSlug = usePrevious(discussionSlug);

  const mounted = useRef();

  useEffect(() => {
    if (!mounted.current) {
      // console.log('useEffect 1 for DiscussionPageCompFunctional');

      if (store.currentTeam && (!isServer || !discussionSlug)) {
        store.currentTeam.loadDiscussions().catch((err) => notify(err));
      }

      const discussion = getDiscussion(discussionSlug);

      if (discussion) {
        discussion.joinSocketRooms();
      }

      console.log(store.socket);

      store.socket.on('discussionEvent', handleDiscussionEvent);
      store.socket.on('postEvent', handlePostEvent);
      store.socket.on('reconnect', handleSocketReconnect);

      (mounted as any).current = true;
    } else {
      // console.log('useEffect 2 for DiscussionPageCompFunctional');

      if (prevDiscussionSlug) {
        const prevDiscussion = getDiscussion(prevDiscussionSlug);
        if (prevDiscussion) {
          prevDiscussion.leaveSocketRooms();
        }
      }

      const discussion = getDiscussion(discussionSlug);

      if (!isServer && discussion) {
        discussion.loadPosts().catch((err) => notify(err));
      }

      if (discussion) {
        discussion.joinSocketRooms();
      }
    }

    return () => {
      const discussion = getDiscussion(discussionSlug);

      if (discussion) {
        discussion.leaveSocketRooms();
      }

      store.socket.off('discussionEvent', handleDiscussionEvent);
      store.socket.off('postEvent', handlePostEvent);
      store.socket.off('reconnect', handleSocketReconnect);
    };
  }, [discussionSlug]);

  const { currentTeam } = store;

  const getDiscussion = (slug: string): Discussion => {
    if (!currentTeam) {
      return;
    }

    if (!slug && currentTeam.discussions.length > 0) {
      Router.replace(
        `/discussion-f?teamSlug=${teamSlug}&discussionSlug=${currentTeam.orderedDiscussions[0].slug}`,
        `/teams/${teamSlug}/discussions-f/${currentTeam.orderedDiscussions[0].slug}`,
      );
      return;
    }

    if (slug && currentTeam) {
      return currentTeam.getDiscussionBySlug(slug);
    }

    return null;
  };

  const renderPosts = () => {
    const discussion = getDiscussion(discussionSlug);

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
                    setSelectedPost(null);
                    setShowMarkdownClicked(false);
                  }}
                />
              ) : (
                <PostDetail
                  key={p._id}
                  post={p}
                  onEditClick={onEditClickCallback}
                  onShowMarkdownClick={onSnowMarkdownClickCallback}
                  isMobile={isMobile}
                  store={store}
                />
              ),
            )
          : null}

        {discussion && discussion.isLoadingPosts && !isServer ? <p>{loading}</p> : null}
      </React.Fragment>
    );
  };

  const onEditClickCallback = (post) => {
    setSelectedPost(post);
    setShowMarkdownClicked(false);
  };

  const onSnowMarkdownClickCallback = (post) => {
    setSelectedPost(post);
    setShowMarkdownClicked(true);
  };

  const handleDiscussionEvent = (data) => {
    console.log('discussion realtime event', data);

    const discussion = getDiscussion(discussionSlug);
    if (discussion) {
      discussion.handleDiscussionRealtimeEvent(data);
    }
  };

  const handlePostEvent = (data) => {
    console.log('post realtime event', data);

    const discussion = getDiscussion(discussionSlug);
    if (discussion) {
      discussion.handlePostRealtimeEvent(data);
    }
  };

  const handleSocketReconnect = () => {
    console.log('pages/discussion.tsx: socket re-connected');

    const discussion = getDiscussion(discussionSlug);
    if (discussion) {
      discussion.loadPosts().catch((err) => notify(err));
      discussion.joinSocketRooms();
    }
  };

  if (!currentTeam || currentTeam.slug !== teamSlug) {
    return (
      <Layout
        store={store}
        isMobile={isMobile}
        firstGridItem={firstGridItem}
        teamRequired={teamRequired}
      >
        <Head>
          <title>No Team is found.</title>
        </Head>
        <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>No Team is found.</div>
      </Layout>
    );
  }

  const discussion = getDiscussion(discussionSlug);

  if (!discussion) {
    if (currentTeam.isLoadingDiscussions) {
      return (
        <Layout
          store={store}
          isMobile={isMobile}
          firstGridItem={firstGridItem}
          teamRequired={teamRequired}
        >
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
        <Layout
          store={store}
          isMobile={isMobile}
          firstGridItem={firstGridItem}
          teamRequired={teamRequired}
        >
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
    <Layout
      store={store}
      isMobile={isMobile}
      firstGridItem={firstGridItem}
      teamRequired={teamRequired}
    >
      <Head>
        <title>{title}</title>
      </Head>
      <div style={{ padding: isMobile ? '0px' : '0px 30px', height: '100vh' }}>
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
        {renderPosts()}
        {discussion && !discussion.isLoadingPosts ? (
          <React.Fragment>
            {selectedPost ? null : (
              <PostForm
                post={null}
                discussion={discussion}
                members={discussion.members}
                isMobile={isMobile}
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

export default withAuth(observer(DiscussionPageCompFunctional));
