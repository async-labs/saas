import React from 'react';

type Props = { html: string };

class PostContent extends React.Component<Props> {
  public render() {
    const { html } = this.props;

    return (
      <div
        style={{ fontSize: '15px', lineHeight: '2em', fontWeight: 300, wordBreak: 'break-all' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}

export default PostContent;
