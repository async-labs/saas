import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React from 'react';

import confirm from '../../lib/confirm';
import notify from '../../lib/notifier';
import { Post, Store, User } from '../../lib/store';
import MenuWithMenuItems from '../common/MenuWithMenuItems';

import PostContent from './PostContent';

const stylePaper = {
  margin: '10px 0px',
  padding: '20px',
};

const styleLineSeparator = {
  verticalAlign: 'text-bottom',
  fontWeight: 300,
  fontSize: '16px',
  margin: '0px 5px',
  opacity: 0.75,
};

const getMenuOptions = post => ({
  dataId: post._id,
  id: `post-menu-${post._id}`,
});

const getMenuItemOptions = (post: Post, currentUser: User, component) => {
  const items = [];

  if (post.createdUserId !== currentUser._id) {
    items.push({
      text: 'Show Markdown',
      dataId: post._id,
      onClick: component.showMarkdown,
    });
  }

  if (post.createdUserId === currentUser._id) {
    const isFirstPost = post.discussion.posts.indexOf(post) === 0;

    items.push({
      text: 'Edit',
      dataId: post._id,
      onClick: component.editPost,
    });

    if (!isFirstPost) {
      items.push({
        text: 'Delete',
        dataId: post._id,
        onClick: component.deletePost,
      });
    }
  }

  return items;
};

class PostDetail extends React.Component<{
  post: Post;
  store?: Store;
  onEditClick: (post) => void;
  onShowMarkdownClick: (post) => void;
  isMobile: boolean;
}> {
  public editPost = () => {
    const { post, onEditClick } = this.props;
    if (onEditClick) {
      onEditClick(post);
    }
    console.log(`PostDetail: ${post._id}`);
  };

  public deletePost = () => {
    confirm({
      title: 'Are you sure?',
      message: '',
      onAnswer: async answer => {
        if (answer) {
          const { post } = this.props;
          await post.discussion.deletePost(post);
          notify('You successfully deleted Post');
        }
      },
    });
  };

  public showMarkdown = () => {
    const { post, onShowMarkdownClick } = this.props;
    if (onShowMarkdownClick) {
      onShowMarkdownClick(post);
    }
  };

  public render() {
    const { post, isMobile } = this.props;

    return <Paper style={stylePaper}>{this.renderPostDetail(post, isMobile)}</Paper>;
  }

  public renderMenu() {
    const { post, store } = this.props;
    const { currentUser } = store;

    if (!post.user || !currentUser || currentUser._id !== post.user._id) {
      return null;
    }

    return (
      <MenuWithMenuItems
        menuOptions={getMenuOptions(post)}
        itemOptions={getMenuItemOptions(post, store.currentUser, this)}
      />
    );
  }

  public renderPostDetail(post: Post, isMobile) {
    const createdDate = moment(post.createdAt).format('MMM Do YYYY');
    const lastEditedDate = moment(post.lastUpdatedAt).fromNow();
    return (
      <React.Fragment>
        <div
          style={{
            float: 'left',
            margin: '-12px 10px 0px -15px',
            zIndex: 1000,
          }}
        >
          {this.renderMenu()}
        </div>
        <div id={`post-${post._id}`}>
          {post.user && (
            <Tooltip
              title={post.user.displayName}
              placement="top"
              disableFocusListener
              disableTouchListener
            >
              <Avatar
                src={post.user.avatarUrl}
                alt={post.user.displayName}
                style={{
                  width: '40px',
                  height: '40px',
                  margin: '0px 10px 0px 5px',
                  cursor: 'pointer',
                  float: 'left',
                }}
              />
            </Tooltip>
          )}
          <div
            style={{
              margin: isMobile ? '0px'  : '0px 20px 0px 70px',
              fontWeight: 300,
              lineHeight: '1em',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 400 }}>
              {`By: ${post.user && post.user.displayName}` || 'User'}
              <span style={styleLineSeparator}>|</span>
              {`Created: ${post.createdAt && createdDate}` || ''}

              {post.isEdited ? (
                <React.Fragment>
                  <span style={styleLineSeparator}>|</span>
                  Last edited: {lastEditedDate}
                </React.Fragment>
              ) : null}
            </span>

            <PostContent html={post.htmlContent} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default inject('store')(observer(PostDetail));
