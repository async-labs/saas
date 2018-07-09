import React from 'react';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';

import MenuWithMenuItems from '../common/MenuWithMenuItems';
import { Store, Post } from '../../lib/store';
import confirm from '../../lib/confirm';
import notify from '../../lib/notifier';

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

const getMenuItemOptions = (post, component) => [
  {
    text: 'Edit',
    dataId: post._id,
    onClick: component.editPost,
  },
  {
    text: 'Delete',
    dataId: post._id,
    onClick: component.deletePost,
  },
];

class PostDetail extends React.Component<{
  post: Post;
  store?: Store;
  onEditClick: Function;
}> {
  editPost = () => {
    const { post, onEditClick } = this.props;
    if (onEditClick) {
      onEditClick(post);
    }
    console.log(`PostDetail: ${post._id}`);
  };

  deletePost = () => {
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

  renderMenu() {
    const { post, store } = this.props;
    const { currentUser } = store;

    if (!post.user || !currentUser || currentUser._id !== post.user._id) {
      return null;
    }

    return (
      <MenuWithMenuItems
        menuOptions={getMenuOptions(post)}
        itemOptions={getMenuItemOptions(post, this)}
      />
    );
  }

  renderPostDetail(post: Post) {
    const createdDate = moment(post.createdAt).format('MMM Do YYYY');
    const lastEditedDate = moment(post.lastUpdatedAt).fromNow();
    return (
      <div>
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
                width: '50px',
                height: '50px',
                margin: '0px 10px 0px 5px',
                cursor: 'pointer',
                float: 'left',
              }}
            />
          </Tooltip>
        )}
        <div
          style={{
            float: 'right',
            margin: '-10px -0px auto auto',
            zIndex: 1000,
          }}
        >
          {this.renderMenu()}
        </div>
        <div
          style={{
            margin: '0px 20px 0px 70px',
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
    );
  }

  render() {
    const { post } = this.props;

    return <Paper style={stylePaper}>{this.renderPostDetail(post)}</Paper>;
  }
}

export default inject('store')(observer(PostDetail));
