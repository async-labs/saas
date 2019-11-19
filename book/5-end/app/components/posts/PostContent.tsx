// 12
// import React from 'react';

// function addPlaceholder(elm) {
//   const body = elm.querySelector('.lazy-load-image-body');
//   const image = elm.querySelector('.s3-image') as HTMLImageElement;
//   if (!body || !image || !image.dataset.src) {
//     return;
//   }

//   image.style.display = 'none';
//   const div = window.document.createElement('div');
//   div.className = 'image-placeholder';
//   div.style.width = `${image.dataset.width || 200}px`;
//   div.style.height = `${image.dataset.height || 200}px`;
//   div.innerHTML = '<p class="image-placeholder-text">loading ...</p>';
//   body.appendChild(div);
// }

// class PostContent extends React.Component<{ html: string }> {
//   public postBodyElm: HTMLDivElement;

//   public componentDidMount() {
//     this.initializeFileUIandEvent();
//   }

//   public componentDidUpdate() {
//     this.initializeFileUIandEvent();
//   }

//   public componentWillUnmount() {
//     const imgContainers = this.postBodyElm.getElementsByClassName('lazy-load-image');

//     for (let i = 0; i < imgContainers.length; i++) {
//       const elm = imgContainers.item(i);
//       elm.removeEventListener('toggle', this.lazyLoadImage);
//     }
//   }

//   public initializeFileUIandEvent() {
//     const imgContainers = this.postBodyElm.querySelectorAll('.lazy-load-image');

//     for (let i = 0; i < imgContainers.length; i++) {
//       const elm = imgContainers.item(i);
//       elm.removeEventListener('toggle', this.lazyLoadImage);
//       elm.addEventListener('toggle', this.lazyLoadImage);

//       addPlaceholder(elm);
//     }
//   }

//   public lazyLoadImage = event => {
//     const target: HTMLDetailsElement = event.currentTarget;

//     if (!target.open) {
//       return;
//     }

//     const image = target.querySelector('.s3-image') as HTMLImageElement;
//     if (!image || image.hasAttribute('loaded') || !image.dataset.src) {
//       return;
//     }

//     const placeholder = target.getElementsByClassName('image-placeholder').item(0);
//     image.onload = () => {
//       if (placeholder) {
//         placeholder.remove();
//       }

//       image.style.display = 'inline';
//     };

//     image.setAttribute('src', image.dataset.src);
//     image.setAttribute('loaded', '1');
//   };

//   public render() {
//     const { html } = this.props;

//     return (
//       <div
//         ref={elm => (this.postBodyElm = elm)}
//         style={{ fontSize: '15px', lineHeight: '2em', fontWeight: 300, wordBreak: 'break-all' }}
//
//         dangerouslySetInnerHTML={{ __html: html }}
//       />
//     );
//   }
// }

// export default PostContent;
