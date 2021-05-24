import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import he from 'he';
import marked from 'marked';
import { observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';
import { Mention, MentionsInput } from 'react-mentions';

import {
  getSignedRequestForUploadApiMethod,
  uploadFileUsingSignedPutRequestApiMethod,
} from '../../lib/api/team-member';
import notify from '../../lib/notify';
import { resizeImage } from '../../lib/resizeImage';
import { Store } from '../../lib/store';
import { User } from '../../lib/store/user';

import PostContent from './PostContent';

function getImageDimension(file): Promise<{ width: number; height: number }> {
  const reader = new FileReader();
  const img = new Image();

  return new Promise((resolve) => {
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.src = e.target.result.toString();
    };
  });
}

type Props = {
  store: Store;
  onChanged: (content) => void;
  content: string;
  members: User[];
  textareaHeight?: string;
  placeholder?: string;
};

type State = { htmlContent: string };

class PostEditor extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      htmlContent: '',
    };
  }

  public render() {
    const { htmlContent } = this.state;
    const { content, members, store } = this.props;
    const { currentUser } = store;

    const membersMinusCurrentUser = members.filter((member) => member._id !== currentUser._id);

    const isThemeDark = store && store.currentUser && store.currentUser.darkTheme === true;
    const textareaBackgroundColor = isThemeDark ? '#0d1117' : '#fff';

    return (
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'inline-flex' }}>
          <Button
            onClick={this.showMarkdownContent}
            variant="text"
            style={{ fontWeight: htmlContent ? 300 : 600, color: '#58a6ff' }}
          >
            Markdown
          </Button>{' '}
          <Button
            onClick={this.showHtmlContent}
            variant="text"
            style={{ fontWeight: htmlContent ? 600 : 300, color: '#58a6ff' }}
          >
            HTML
          </Button>
        </div>

        <div style={{ display: 'inline', float: 'left' }}>
          <label htmlFor="upload-file">
            <Button component="span" style={{ color: '#58a6ff' }}>
              <i className="material-icons" style={{ fontSize: '22px' }}>
                insert_photo
              </i>
            </Button>
          </label>
          <input
            accept="image/*"
            name="upload-file"
            id="upload-file"
            type="file"
            style={{ display: 'none' }}
            onChange={(event) => {
              const file = event.target.files[0];
              event.target.value = '';
              this.uploadFile(file);
            }}
          />
        </div>
        <br />
        <div
          style={{
            width: '100%',
            height: '100vh',
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
                  height: '100vh',
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
              onChange={(event) => {
                this.props.onChanged(event.target.value);
              }}
            >
              <Mention
                trigger="@"
                data={membersMinusCurrentUser.map((u) => ({
                  id: u.avatarUrl,
                  display: u.displayName,
                  // you: u._id === currentUser._id ? true : false,
                }))}
                markup={'[`@#__display__`](__id__)'}
                displayTransform={(_, display) => {
                  return `@${display}`;
                }}
                renderSuggestion={(suggestion) => (
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

    const bucket = process.env.BUCKET_FOR_POSTS;
    const prefix = `${currentTeam.slug}`;
    const fileName = file.name;
    const fileType = file.type;

    try {
      const responseFromApiServerForUpload = await getSignedRequestForUploadApiMethod({
        fileName,
        fileType,
        prefix,
        bucket,
      });

      let imageMarkdown;
      let fileUrl;

      if (file.type.startsWith('image/')) {
        const { width } = await getImageDimension(file);
        const resizedFile = await resizeImage(file, 1024, 1024);

        await uploadFileUsingSignedPutRequestApiMethod(
          resizedFile,
          responseFromApiServerForUpload.signedRequest,
        );

        fileUrl = responseFromApiServerForUpload.url;

        console.log(fileUrl);

        const finalWidth = width > 768 ? '100%' : `${width}px`;

        imageMarkdown = `
          <div>
            <img style="max-width: ${finalWidth}; width:100%" src="${fileUrl}" alt="Async" class="s3-image" />
          </div>`;
      } else {
        await uploadFileUsingSignedPutRequestApiMethod(
          file,
          responseFromApiServerForUpload.signedRequest,
        );

        fileUrl = responseFromApiServerForUpload.url;
        imageMarkdown = `[${file.name}](${fileUrl})`;
      }

      const content = `${this.props.content}\n${imageMarkdown.replace(/\s+/g, ' ')}`;

      this.props.onChanged(content);

      NProgress.done();
      notify('You successfully uploaded file.');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      NProgress.done();
    }
  };
}

export default observer(PostEditor);
