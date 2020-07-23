import Button from '@material-ui/core/Button';
import he from 'he';
import marked from 'marked';
import { observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';

import notify from '../../lib/notify';
import { Store } from '../../lib/store';
import { Discussion } from '../../lib/store/discussion';
import { Post } from '../../lib/store/post';
import { User } from '../../lib/store/user';

import PostEditor from './PostEditor';

type Props = {
  store: Store;
  isMobile: boolean;
  members: User[];
  post: Post;
  discussion: Discussion;
  showMarkdownToNonCreator?: boolean;
  onFinished?: () => void;
};

type State = {
  postId: string;
  content: string;
  disabled: boolean;
};

class PostForm extends React.Component<Props, State> {
  public state = {
    postId: null,
    content: '',
    disabled: false,
  };
  
  public static getDerivedStateFromProps(props: Props, state) {
    const { post } = props;

    if (!post && !state.postId) {
      return null;
    }

    if (post && post._id === state.postId) {
      return null;
    }

    return {
      postId: (post && post._id) || null,
      content: (post && post.content) || '',
    };
  }

  public render() {
    const { store, members, post, isMobile, showMarkdownToNonCreator } = this.props;
    const isEditingPost = !!post;

    let title = 'Add Post';
    if (showMarkdownToNonCreator) {
      title = 'Showing Markdown';
    } else if (isEditingPost) {
      title = 'Edit Post';
    }

    return (
      <div style={{ height: '100%', margin: '0px 20px' }}>
        <p />
        <br />
        <h3>{title}</h3>
        <form style={{ width: '100%', height: '100%' }} onSubmit={this.onSubmit} autoComplete="off">
          <p />
          <br />
          <div>
            {showMarkdownToNonCreator ? null : (
              <React.Fragment>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={this.state.disabled}
                >
                  {isEditingPost ? 'Save changes' : 'Publish Post'}
                </Button>
                {isMobile ? <p /> : null}
              </React.Fragment>
            )}
            {isEditingPost ? (
              <Button
                variant="outlined"
                onClick={this.closeForm}
                disabled={this.state.disabled}
                style={{ marginLeft: '10px' }}
              >
                {showMarkdownToNonCreator ? 'Go back' : 'Cancel'}
              </Button>
            ) : null}
          </div>
          <p />
          <br />
          <PostEditor
            content={this.state.content}
            onChanged={this.onContentChanged}
            members={members}
            textareaHeight="100%"
            store={store}
          />
          <p />
          <div style={{ margin: '20px 0px' }}>
            {isEditingPost ? (
              <Button
                variant="outlined"
                onClick={this.closeForm}
                disabled={this.state.disabled}
                style={{ marginLeft: '10px' }}
              >
                {showMarkdownToNonCreator ? 'Go back' : 'Cancel'}
              </Button>
            ) : null}
          </div>
          <p />
          <br />
        </form>
      </div>
    );
  }

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { content } = this.state;
    const htmlContent = marked(he.decode(content));
    const { post, onFinished, store, discussion } = this.props;
    const isEditingPost = !!post;

    if (!content) {
      notify('Add content to your Post');
      return;
    }

    if (isEditingPost) {
      this.setState({ disabled: true });
      NProgress.start();
      try {
        await post.editPost({ content, htmlContent });
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

  private onContentChanged = (content: string) => {
    this.setState({ content });
  };

  private closeForm = () => {
    this.setState({ content: '', postId: null });

    const { onFinished } = this.props;
    if (onFinished) {
      onFinished();
    }
  };
}

export default observer(PostForm);
