import React from 'react';

function addPlaceholder(elm) {
  const body = elm.querySelector('.lazy-load-image-body');
  const image = elm.querySelector('.s3-image') as HTMLImageElement;
  if (!body || !image || !image.dataset.src) {
    return;
  }

  // TODO: if width of image placeholder is greater than width of PostDetail div - make width of image placeholder to be 100%

  image.style.display = 'none';
  let div = window.document.createElement('div');
  div.className = 'image-placeholder';
  div.style.width = `${image.dataset.width || 200}px`;
  div.style.height = `${image.dataset.height || 200}px`;
  div.innerHTML = `<p class="image-placeholder-text">loading ...</p>`;
  body.appendChild(div);
}

class PostContent extends React.Component<{ html: string }> {
  postBodyElm: HTMLDivElement;

  componentDidMount() {
    this.initializeFileUIandEvent();
  }

  componentDidUpdate() {
    this.initializeFileUIandEvent();
  }

  componentWillUnmount() {
    const imgContainers = this.postBodyElm.getElementsByClassName('lazy-load-image');

    for (let i = 0; i < imgContainers.length; i++) {
      const elm = imgContainers.item(i);
      elm.removeEventListener('toggle', this.lazyLoadImage);
    }
  }

  initializeFileUIandEvent() {
    const imgContainers = this.postBodyElm.querySelectorAll('.lazy-load-image');

    for (let i = 0; i < imgContainers.length; i++) {
      const elm = imgContainers.item(i);
      elm.removeEventListener('toggle', this.lazyLoadImage);
      elm.addEventListener('toggle', this.lazyLoadImage);

      addPlaceholder(elm);
    }
  }

  lazyLoadImage = event => {
    const target: HTMLDetailsElement = event.currentTarget;

    if (!target.open) {
      return;
    }

    const image = target.querySelector('.s3-image') as HTMLImageElement;
    if (!image || image.hasAttribute('loaded') || !image.dataset.src) {
      return;
    }

    const placeholder = target.getElementsByClassName('image-placeholder').item(0);
    image.onload = function() {
      if (placeholder) {
        placeholder.remove();
      }

      image.style.display = 'inline';
    };

    image.setAttribute('src', image.dataset.src);
    image.setAttribute('loaded', '1');
  };

  render() {
    const { html } = this.props;

    return (
      <div
        ref={elm => (this.postBodyElm = elm)}
        style={{ fontSize: '15px', lineHeight: '2em', fontWeight: 300 }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}

export default PostContent;
