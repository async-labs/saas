import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import he from 'he';
import marked from 'marked';
import { inject, observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';

import notify from '../../lib/notifier';
import { Discussion, Post, Store, User } from '../../lib/store';

import PostEditor from './PostEditor';

const styles = {
  paper: {
    width: '100%', // TODO: should 100% when isMobile is true
    padding: '0px 20px 20px 20px',
  },
};

type MyProps = {
  store?: Store;
  members: User[];
  post?: Post;
  onFinished?: () => void;
  open?: boolean;
  classes: { paper: string };
  discussion: Discussion;
};

type MyState = {
  postId: string | null;
  content: string;
  disabled: boolean;
};

class PostForm extends React.Component<MyProps, MyState> {
  public static getDerivedStateFromProps(props: MyProps, state) {
    const { post } = props;

    if (!post && !state.postId) {
      return null;
    }

    if (post && post._id === state.postId) {
      return null;
    }

    return {
      content: (post && post.content) || '',
      postId: (post && post._id) || null,
    };
  }

  public state = {
    postId: null,
    content: '',
    disabled: false,
  };

  public render() {
    const { classes, open, members } = this.props;
    const isEditing = !!this.props.post;

    const { paper } = classes;

    return (
      <Drawer
        anchor="right"
        open={open}
        classes={{ paper }}
        transitionDuration={{ enter: 500, exit: 500 }}
      >
        <div style={{ width: '100%', height: '100%', padding: '20px' }}>
          <h3>{isEditing ? 'Edit Post' : 'Add Post'}</h3>
          <form style={{ width: '100%', height: '100%' }} onSubmit={this.onSubmit}>
            <p />
            <div style={{ margin: '20px 0px' }}>
              <Button variant="outlined" onClick={this.closeDrawer} disabled={this.state.disabled}>
                Cancel
              </Button>{' '}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={this.state.disabled}
              >
                {isEditing ? 'Save changes' : 'Publish'}
              </Button>
            </div>
            <p />
            <PostEditor
              content={this.state.content}
              onChanged={content => this.setState({ content })}
              members={members}
            />
            <br />
          </form>
        </div>
      </Drawer>
    );
  }

  public onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { content } = this.state;
    const htmlContent = marked(he.decode(content));
    const { post, onFinished, store, discussion } = this.props;
    const isEditing = !!post;

    if (!content) {
      notify('Add content to your Post');
      return;
    }

    if (isEditing) {
      this.setState({ disabled: true });
      NProgress.start();
      try {
        await post.edit({ content, htmlContent });
        notify('You successfully edited Post');
      } catch (error) {
        console.log(error);
        notify(error);
      } finally {
        this.setState({ disabled: false });
        NProgress.done();
      }

      if (onFinished) {
        onFinished();
      }

      return;
    }

    const { currentTeam } = store;
    if (!currentTeam) {
      notify('Team is not selected or does not exist.');
      return;
    }

    NProgress.start();
    this.setState({ disabled: true });

    try {
      await discussion.addPost(content);
      this.setState({ content: '' });
      notify('You successfully published Post.');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }

    if (onFinished) {
      onFinished();
    }
  };

  public closeDrawer = () => {
    this.setState({ content: '', postId: null });

    const { onFinished } = this.props;
    if (onFinished) {
      onFinished();
    }
  };
}

export default withStyles(styles)<MyProps>(inject('store')(observer(PostForm)));
