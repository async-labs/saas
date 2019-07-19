import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import he from 'he';
import marked from 'marked';
import { inject, observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';
import { Mention, MentionsInput } from 'react-mentions';

import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../../lib/api/team-member';
import notify from '../../lib/notifier';
import { resizeImage } from '../../lib/resizeImage';
import { Store, User } from '../../lib/store';

import PostContent from './PostContent';

import { BUCKET_FOR_POSTS } from '../../lib/consts';

function getImageDimension(file): Promise<{ width: number; height: number }> {
  const reader = new FileReader();
  const img = new Image();

  return new Promise(resolve => {
    reader.onload = e => {
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

type MyProps = {
  store?: Store;
  onChanged: (content) => void;
  content: string;
  members: User[];
  textareaHeight?: string;
  readOnly?: boolean;
  placeholder?: string;
};

type MyState = {
  htmlContent: string;
};

class PostEditor extends React.Component<MyProps, MyState> {
  private textAreaRef;

  constructor(props) {
    super(props);

    this.state = {
      htmlContent: '',
    };

    this.textAreaRef = React.createRef();
  }

  public render() {
    const { htmlContent } = this.state;
    const { content, members, store } = this.props;
    const { currentUser } = store;

    const membersMinusCurrentUser = members.filter(member => member._id !== currentUser._id);

    const isThemeDark = store && store.currentUser && store.currentUser.darkTheme === true;
    const textareaBackgroundColor = isThemeDark ? '#303030' : '#fff';

    return (
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'inline-flex' }}>
          <Button
            color="primary"
            onClick={this.showMarkdownContent}
            variant="text"
            style={{ fontWeight: htmlContent ? 300 : 600 }}
          >
            Markdown
          </Button>{' '}
          <Button
            color="primary"
            onClick={this.showHtmlContent}
            variant="text"
            style={{ fontWeight: htmlContent ? 600 : 300 }}
          >
            HTML
          </Button>
        </div>

        <div style={{ display: 'inline', float: 'left' }}>
          <input
            accept="image/*"
            name="upload-file"
            id="upload-file"
            type="file"
            style={{ display: 'none' }}
            onChange={event => {
              const file = event.target.files[0];
              event.target.value = '';
              this.uploadFile(file);
            }}
          />
          <label htmlFor="upload-file">
            <Button color="primary" component="span">
              <i className="material-icons" style={{ fontSize: '22px' }}>
                insert_photo
              </i>
            </Button>
          </label>
        </div>
        <br />
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '10px 15px',
            border: isThemeDark
              ? '1px solid rgba(255, 255, 255, 0.5)'
              : '1px solid rgba(0, 0, 0, 0.5)',
          }}
        >
          {htmlContent ? (
            <PostContent html={htmlContent} />
          ) : (
            <MentionsInput
              style={{
                input: {
                  border: 'none',
                  outline: 'none',
                  font: '16px Roboto',
                  color: isThemeDark ? '#fff' : '#000',
                  fontWeight: 300,
                  height: '100vh', // TODO: check on Mobile
                  lineHeight: '1.5em',
                  backgroundColor: content ? textareaBackgroundColor : 'transparent',
                },
                suggestions: {
                  list: {
                    backgroundColor: '#222',
                    color: '#fff',
                  },

                  item: {
                    padding: '5px 15px',
                    borderBottom: '1px solid rgba(0,0,0,0.15)',

                    '&focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                },
              }}
              autoFocus
              value={content}
              placeholder={this.props.placeholder ? this.props.placeholder : 'Compose new post'}
              onChange={event => {
                this.props.onChanged(event.target.value);
              }}
            >
              <Mention
                trigger="@"
                data={membersMinusCurrentUser.map(u => ({
                  id: u.avatarUrl,
                  display: u.displayName,
                  you: u._id === currentUser._id ? true : false,
                }))}
                markup={'[`@#__display__`](__id__)'}
                displayTransform={(_, display) => {
                  return `@${display}`;
                }}
                renderSuggestion={suggestion => (
                  <React.Fragment>
                    <Avatar
                      role="presentation"
                      src={suggestion.id}
                      alt={suggestion.display}
                      style={{
                        width: '24px',
                        height: '24px',
                        marginRight: '10px',
                        display: 'inline-flex',
                        verticalAlign: 'middle',
                      }}
                    />
                    <span style={{ marginRight: '5px' }}>{suggestion.display}</span>
                  </React.Fragment>
                )}
              />
            </MentionsInput>
          )}
        </div>
      </div>
    );
  }

  public showMarkdownContent = () => {
    this.setState({ htmlContent: '' });
  };

  public showHtmlContent = async () => {
    const { content } = this.props;

    function markdownToHtml(postContent) {
      const renderer = new marked.Renderer();

      renderer.link = (href, title, text) => {
        const t = title ? ` title="${title}"` : '';

        if (text.startsWith('<code>@#')) {
          return `${text.replace('<code>@#', '<code>@')} `;
        }

        return `
          <a target="_blank" href="${href}" rel="noopener noreferrer"${t}>
            ${text}
            <i class="material-icons" style="font-size: 13px; vertical-align: baseline">
              launch
            </i>
          </a>
        `;
      };

      marked.setOptions({
        renderer,
        breaks: true,
      });

      return marked(he.decode(postContent));
    }

    const htmlContent = content ? markdownToHtml(content) : '<span>Nothing to preview.</span>';
    this.setState({ htmlContent });
  };

  private uploadFile = async (file: File) => {
    if (!file) {
      notify('No file selected.');
      return;
    }

    if (!file.type || (!file.type.startsWith('image/') && file.type !== 'application/pdf')) {
      notify('Wrong file.');
      return;
    }

    const { store } = this.props;
    const { currentTeam } = store;

    NProgress.start();

    const bucket = BUCKET_FOR_POSTS;
    const prefix = `${currentTeam.slug}`;

    try {
      const responseFromApiServerForUpload = await getSignedRequestForUpload({
        file,
        prefix,
        bucket,
      });

      let markdown;

      if (file.type.startsWith('image/')) {
        const { width } = await getImageDimension(file);
        const resizedFile = await resizeImage(file, 1024, 1024);

        await uploadFileUsingSignedPutRequest(
          resizedFile,
          responseFromApiServerForUpload.signedRequest,
        );

        const imgSrc = responseFromApiServerForUpload.url;

        const finalWidth = width > 768 ? '100%' : `${width}px`;

        markdown = `
        <div>
          <img style="max-width: ${finalWidth}; width:100%" src="${imgSrc}" alt="Async" class="s3-image" />
        </div>`;
      } else if (file.type === 'application/pdf') {
        await uploadFileUsingSignedPutRequest(file, responseFromApiServerForUpload.signedRequest);

        const fileUrl = responseFromApiServerForUpload.url;

        markdown = `[${file.name}](${fileUrl})`;
      }

      const editor = this.textAreaRef && this.textAreaRef.current;
      if (editor) {
        const startPos = editor.selectionStart;
        editor.value = `${editor.value.substring(0, startPos)}\n${markdown.replace(
          /\s+/g,
          ' ',
        )}${editor.value.substring(startPos, editor.value.length)}`;

        this.props.onChanged(editor.value);
      }

      // TODO: delete image if image is added but Post is not saved
      //       see more on Github's issue
      NProgress.done();
      notify('You successfully uploaded file.');
    } catch (error) {
      console.log(error);
      notify(error);
      NProgress.done();
    }
  };
}

export default inject('store')(observer(PostEditor));
