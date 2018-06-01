import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Drawer } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import NProgress from 'nprogress';
import { inject, observer } from 'mobx-react';
import marked from 'marked';
import he from 'he';

import notify from '../../lib/notifier';
import { Store, Post } from '../../lib/store';
import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../../lib/api/team-member';
import getRootUrl from '../../lib/api/getRootUrl';

const styles = {
  paper: {
    width: '75%', // TODO: should 100% when isMobile is true
    padding: '0px 20px 20px 20px',
  },
};

@inject('store')
@observer
class PostForm extends React.Component<
  {
    store?: Store;
    post?: Post;
    onFinished?: Function;
    open?: boolean;
    isEditing?: boolean;
    classes: { paper: string };
  },
  {
    content: string;
    htmlContent: string;
    disabled: boolean;
    uploadedFileUrl: string;
  }
> {
  state = {
    content: '',
    htmlContent: '',
    disabled: false,
    uploadedFileUrl: '',
  };

  static getDerivedStateFromProps(nextProps) {
    const { post, isEditing } = nextProps;

    return {
      content: (isEditing && post.content) || '',
    };
  }

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { content } = this.state;
    const htmlContent = marked(he.decode(content));
    const { post, onFinished, store, isEditing } = this.props;

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
      await currentDiscussion.addPost({ content });

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
    const { onFinished } = this.props;
    if (onFinished) {
      onFinished();
    }
  };

  showMarkdownContent = () => {
    const { content } = this.state;
    this.setState({ content: content, htmlContent: '' });
  };

  showHtmlContent = async () => {
    const { content } = this.state;

    function markdownToHtml(content) {
      const renderer = new marked.Renderer();

      renderer.link = (href, title, text) => {
        const t = title ? ` title="${title}"` : '';
        return `
          <a target="_blank" href="${href}" rel="noopener noreferrer"${t}>
            ${text}
            <i class="material-icons" style="font-size: 16px; vertical-align: baseline">
              launch
            </i>
          </a>
        `;
      };

      renderer.image = href => {
        return `
          <img
            src="${href}"
            id="s3-file"
            alt="Async"
          />
        `;
      };

      marked.setOptions({
        renderer,
        breaks: true,
      });

      return marked(he.decode(content));
    }

    const htmlContent = content ? markdownToHtml(content) : 'Nothing to preview.';
    this.setState({ htmlContent: htmlContent });
  };

  uploadFile = async () => {
    const { content } = this.state;
    const { store } = this.props;
    const { currentTeam } = store;

    const file = document.getElementById('upload-file').files[0];
    document.getElementById('upload-file').value = '';
    const prefix = currentTeam.slug;

    // console.log(file);

    if (file == null) {
      return notify('No file selected.');
    }

    NProgress.start();

    try {
      const responseFromApiServerForUpload = await getSignedRequestForUpload(file, prefix);
      await uploadFileUsingSignedPutRequest(file, responseFromApiServerForUpload.signedRequest);

      const markdownImage = `<details><summary>Click to see <b>${file.name}</b></summary>\n\n![${
        file.name
      }](${getRootUrl()}/uploaded-file?path=${responseFromApiServerForUpload.path})\n\n</details>`;

      this.setState({ content: content.concat('\n', markdownImage) });

      // TODO: delete image if image is added but not saved to folder
      // TODO: see more on Github's issue
      NProgress.done();
      notify('You successfully uploaded file.');
    } catch (error) {
      console.log(error);
      notify(error);
      NProgress.done();
    }
  };

  render() {
    const { classes, open, isEditing } = this.props;

    const { paper } = classes;

    const { content, htmlContent } = this.state;

    return (
      <div>
        <Drawer
          anchor="right"
          open={open}
          classes={{ paper }}
          transitionDuration={{ enter: 500, exit: 500 }}
        >
          <div style={{ width: '100%', height: '100%', padding: '20px' }}>
            <h3>{isEditing ? 'Edit Post' : 'Add Post'}</h3>
            <form
              style={{ width: '100%', height: '75%' }}
              onSubmit={this.onSubmit}
              encType="multipart/form-data"
            >
              <div style={{ float: 'left', display: 'inline-flex' }}>
                <Button
                  color="primary"
                  onClick={this.showMarkdownContent}
                  variant={htmlContent ? 'flat' : 'outlined'}
                >
                  Markdown
                </Button>{' '}
                <Button
                  color="primary"
                  onClick={this.showHtmlContent}
                  variant={htmlContent ? 'outlined' : 'flat'}
                >
                  HTML
                </Button>{' '}
              </div>

              <div
                style={{
                  display: 'inline',
                  float: 'right',
                }}
              >
                <input
                  accept="image/*"
                  name="upload-file"
                  id="upload-file"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={this.uploadFile}
                />
                <label htmlFor="upload-file">
                  <Button color="primary" component="span">
                    Upload file
                  </Button>
                </label>
              </div>
              <br />
              <br />
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '10px 15px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                {htmlContent ? (
                  <div
                    style={{ height: 'inherit' }}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    autoFocus
                    value={content}
                    placeholder="Compose new post"
                    multiline
                    rows={24} // TODO: add isMobile logic later
                    rowsMax={24}
                    InputProps={{
                      disableUnderline: true,
                    }}
                    onChange={event => {
                      this.setState({ content: event.target.value });
                    }}
                  />
                )}
              </div>
              <p />
              <div style={{ float: 'right' }}>
                <Button
                  variant="outlined"
                  onClick={this.closeDrawer}
                  disabled={this.state.disabled}
                >
                  Cancel
                </Button>{' '}
                <Button
                  type="submit"
                  variant="raised"
                  color="primary"
                  disabled={this.state.disabled}
                >
                  {isEditing ? 'Save changes' : 'Publish'}
                </Button>
              </div>
              <br />
            </form>
          </div>
        </Drawer>
      </div>
    );
  }
}

export default withStyles(styles)<{
  post?: Post;
  onFinished?: Function;
  open?: boolean;
  isEditing?: boolean;
}>(PostForm);
