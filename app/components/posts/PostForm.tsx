import React from 'react';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import NProgress from 'nprogress';
import { inject, observer } from 'mobx-react';
import marked from 'marked';
import he from 'he';

import notify from '../../lib/notifier';
import { Store, Post } from '../../lib/store';

import PostEditor from './PostEditor';

const styles = {
  paper: {
    width: '100%',
    padding: '0px 20px 20px 20px',
  },
};

interface MyProps {
  store?: Store;
  post?: Post;
  onFinished?: Function;
  open?: boolean;
  classes: { paper: string };
}

interface MyState {
  postId: string | null;
  content: string;
  disabled: boolean;
}

@inject('store')
@observer
class PostForm extends React.Component<MyProps, MyState> {
  state = {
    postId: null,
    content: '',
    disabled: false,
  };

  static getDerivedStateFromProps(props: MyProps, state) {
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

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { content } = this.state;
    const htmlContent = marked(he.decode(content));
    const { post, onFinished, store } = this.props;
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
        NProgress.done();
        this.setState({ disabled: false });
        notify('You successfully edited Post');
      } catch (error) {
        console.log(error);
        notify(error);
        NProgress.done();
        this.setState({ disabled: false });
      }

      if (onFinished) {
        onFinished();
      }

      return;
    }

    const { currentTeam } = store;
    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { currentTopic } = currentTeam;
    if (!currentTopic) {
      notify('Topic have not selected');
      return;
    }

    const { currentDiscussion } = currentTopic;
    if (!currentDiscussion) {
      notify('Discussion have not selected');
      return;
    }

    NProgress.start();
    this.setState({ disabled: true });

    try {
      await currentDiscussion.addPost(content);

      this.setState({ content: '' });
      NProgress.done();
      this.setState({ disabled: false });
      notify('You successfully published Post');
    } catch (error) {
      console.log(error);
      notify(error);
      NProgress.done();
      this.setState({ disabled: false });
    }

    if (onFinished) {
      onFinished();
    }
  };

  closeDrawer = () => {
    this.setState({ content: '', postId: null });

    const { onFinished } = this.props;
    if (onFinished) {
      onFinished();
    }
  };

  render() {
    const { classes, open } = this.props;
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
          <form style={{ width: '100%', height: '75%' }} onSubmit={this.onSubmit}>
            <PostEditor
              content={this.state.content}
              onChanged={content => this.setState({ content })}
            />
            <p />
            <div style={{ float: 'right' }}>
              <Button variant="outlined" onClick={this.closeDrawer} disabled={this.state.disabled}>
                Cancel
              </Button>{' '}
              <Button type="submit" variant="raised" color="primary" disabled={this.state.disabled}>
                {isEditing ? 'Save changes' : 'Publish'}
              </Button>
            </div>
            <br />
          </form>
        </div>
      </Drawer>
    );
  }
}

export default withStyles(styles)<{
  post?: Post;
  onFinished?: Function;
  open?: boolean;
}>(PostForm);
