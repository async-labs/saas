import React from 'react';

class PostContent extends React.Component<{
  html: string;
}> {
  postBodyElm: HTMLDivElement;

  componentDidMount() {
    this.addImageLoadEvent();
  }

  componentDidUpdate() {
    this.addImageLoadEvent();
  }

  componentWillUnmount() {
    const imgContainers = this.postBodyElm.getElementsByClassName('lazy-load-image');

    for (let i = 0; i < imgContainers.length; i++) {
      const elm = imgContainers.item(i);
      elm.removeEventListener('toggle', this.lazyLoadImage);
    }
  }

  addImageLoadEvent() {
    const imgContainers = this.postBodyElm.getElementsByClassName('lazy-load-image');

    for (let i = 0; i < imgContainers.length; i++) {
      const elm = imgContainers.item(i);
      elm.removeEventListener('toggle', this.lazyLoadImage);
      elm.addEventListener('toggle', this.lazyLoadImage);
    }
  }

  lazyLoadImage = event => {
    const target: HTMLDetailsElement = event.currentTarget;

    if (!target.open) {
      return;
    }

    const image = target.getElementsByClassName('s3-image').item(0) as HTMLImageElement;
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
