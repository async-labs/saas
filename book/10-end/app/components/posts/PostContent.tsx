import React from 'react';

type Props = { html: string };

class PostContent extends React.Component<Props> {
  public render() {
    const { html } = this.props;

    return (
      <div
        style={{ fontSize: '15px', lineHeight: '2em', font: '16px Roboto', wordBreak: 'break-all' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}

export default PostContent;
