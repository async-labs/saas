import React from 'react';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import Paper from '@material-ui/core/Paper';

import MenuWithMenuItems from '../common/MenuWithMenuItems';
import { Store, Post } from '../../lib/store';
import confirm from '../../lib/confirm';
import notify from '../../lib/notifier';
import AvatarWithMenu from '../common/AvatarwithMenu';

import PostContent from './PostContent';

const stylePaper = {
  margin: '10px 0px',
  padding: '20px',
};

const getMenuOptions = post => ({
  dataId: post._id,
  id: `post-menu-${post._id}`,
  tooltipTitle: 'Settings for Post',
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
      <div>
        <MenuWithMenuItems
          menuOptions={getMenuOptions(post)}
          itemOptions={getMenuItemOptions(post, this)}
        />
      </div>
    );
  }

  renderPostDetail(post: Post) {
    const date = moment(post.createdAt).format('MMM Do YYYY');
    return (
      <div>
        {post.user && <AvatarWithMenu src={post.user.avatarUrl} alt={post.user.displayName} />}
        {this.renderMenu()}
        <div
          style={{
            margin: '0px 20px 0px 70px',
            fontWeight: 300,
            lineHeight: '1em',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, verticalAlign: 'top' }}>
            {(post.user && post.user.displayName) || 'User'} |{' '}
            {(post.createdAt && date) || 'no date'} {post.isEdited ? '| edited' : ''}
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
