import React from 'react';
import Button from '@material-ui/core/Button';
import TextArea from '@material-ui/core/Input/Textarea';
import NProgress from 'nprogress';
import { inject, observer } from 'mobx-react';
import marked from 'marked';
import he from 'he';

import { Store } from '../../lib/store';
import notify from '../../lib/notifier';
import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../../lib/api/team-member';
import getRootUrl from '../../lib/api/getRootUrl';

import PostContent from './PostContent';

function getImageDimension(file): Promise<{ width: number; height: number }> {
  var reader = new FileReader();
  var img = new Image();

  return new Promise(resolve => {
    reader.onload = e => {
      img.onload = function() {
        resolve({ width: img.width, height: img.height });
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

interface MyProps {
  store?: Store;
  onChanged: Function;
  content: string;
}

interface MyState {
  htmlContent: string;
}

@inject('store')
@observer
class PostEditor extends React.Component<MyProps, MyState> {
  state = {
    htmlContent: '',
  };

  showMarkdownContent = () => {
    this.setState({ htmlContent: '' });
  };

  showHtmlContent = async () => {
    const { content } = this.props;

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
    const { content } = this.props;
    const { store } = this.props;
    const { currentTeam } = store;

    const file = document.getElementById('upload-file').files[0];

    if (file == null) {
      notify('No file selected.');
      return;
    }

    document.getElementById('upload-file').value = '';

    const bucket = 'async-posts';
    const prefix = `${currentTeam.slug}`;

    const { width, height } = await getImageDimension(file);

    NProgress.start();

    try {
      const responseFromApiServerForUpload = await getSignedRequestForUpload({
        file,
        prefix,
        bucket,
      });

      await uploadFileUsingSignedPutRequest(file, responseFromApiServerForUpload.signedRequest);

      const imgSrc = `${getRootUrl()}/uploaded-file?teamSlug=${
        currentTeam.slug
      }&bucket=${bucket}&path=${responseFromApiServerForUpload.path}`;

      const markdownImage = `<details class="lazy-load-image">
        <summary>Click to see <b>${file.name}</b></summary>

        <img data-src="${imgSrc}" alt="Async" class="s3-image" style="display: none;" />
        <div class="image-placeholder" style="width: ${width}px; height: ${height}px;">
          <p class="image-placeholder-text">loading ...</p>
        </div>
      </details>`;

      this.props.onChanged(content.concat('\n', markdownImage.replace(/\s+/g, ' ')));

      // TODO: delete image if image is added but Post is not saved
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
    const { htmlContent } = this.state;
    const { content } = this.props;

    return (
      <React.Fragment>
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
          </Button>
        </div>

        <div style={{ display: 'inline', float: 'right' }}>
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
            overflow: 'auto',
          }}
        >
          {htmlContent ? (
            <PostContent html={htmlContent} />
          ) : (
            <TextArea
              style={{
                overflow: 'hidden !important',
                font: '16px Muli',
                color: '#fff',
                fontWeight: 300,
                lineHeight: '1.5em',
              }}
              value={content}
              placeholder="Compose new post"
              rows={24} // TODO: add isMobile logic later
              onChange={event => {
                this.props.onChanged(event.target.value);
              }}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default PostEditor;
