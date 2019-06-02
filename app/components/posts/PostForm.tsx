import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import he from 'he';
import marked from 'marked';
import { inject, observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';

import env from '../../lib/env';

import notify from '../../lib/notifier';
import { Discussion, Post, Store, User } from '../../lib/store';

import PostEditor from './PostEditor';

const { URL_APP } = env;

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
  readOnly?: boolean;
  isMobile?: boolean;
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
    const { members, post, isMobile, readOnly } = this.props;
    const isEditing = !!post;

    let title = 'Add Post';
    if (readOnly) {
      title = 'Show Markdown';
    } else if (isEditing) {
      title = 'Edit Post';
    }

    return (
      <div style={{ height: '100%', margin: '0px 20px' }}>
        <p />
        <br />
        <h3>{title} </h3>
        <form style={{ width: '100%', height: '100%' }} onSubmit={this.onSubmit} autoComplete="off">
          <p />
          <br />
          <div>
            {readOnly ? null : (
              <React.Fragment>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={this.state.disabled}
                >
                  {isEditing ? 'Save changes' : 'Publish Post'}
                </Button>
                {isMobile ? <p /> : null}
              </React.Fragment>
            )}
            {post ? (
              <Button
                variant="outlined"
                onClick={this.closeForm}
                disabled={this.state.disabled}
                style={{ marginLeft: '10px' }}
              >
                {readOnly ? 'Go back' : 'Cancel'}
              </Button>
            ) : null}
          </div>
          <p />
          <br />
          <PostEditor
            readOnly={readOnly}
            content={this.state.content}
            onChanged={this.onContentChanged}
            members={members}
            textareaHeight="100%"
          />
          <p />
          <div style={{ margin: '20px 0px' }}>
            {post ? (
              <Button
                variant="outlined"
                onClick={this.closeForm}
                disabled={this.state.disabled}
                style={{ marginLeft: '10px' }}
              >
                {readOnly ? 'Go back' : 'Cancel'}
              </Button>
            ) : null}
          </div>
          <p />
          <br />
        </form>
      </div>
    );
  }

  private onContentChanged = (content: string) => {
    this.setState({ content });
  };

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      const newPost = await discussion.addPost(content);

      if (discussion.notificationType === 'email') {
        const userIdsForLambda = discussion.memberIds.filter(m => m !== discussion.createdUserId);
        await discussion.sendDataToLambdaApiMethod({
          discussionName: discussion.name,
          discussionLink: `${URL_APP}/team/${discussion.team.slug}/discussions/${discussion.slug}`,
          postContent: newPost.content,
          authorName: newPost.user.displayName,
          userIds: userIdsForLambda,
        });
      }
      this.setState({ content: '' });
      notify('You successfully published new Post.');
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

  private closeForm = () => {
    this.setState({ content: '', postId: null });

    const { onFinished } = this.props;
    if (onFinished) {
      onFinished();
    }
  };
}

export default withStyles(styles)(inject('store')(observer(PostForm)));
