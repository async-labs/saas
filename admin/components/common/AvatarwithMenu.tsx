import React from 'react';
// import Link from 'next/link';
import Avatar from '@material-ui/core/Avatar';

class AvatarWithMenu extends React.PureComponent<{ src?: string; alt?: string }> {
  state = {
    open: false,
    anchorEl: undefined,
  };

  render() {
    const { src, alt } = this.props;

    return (
      <Avatar
        role="presentation"
        src={src}
        alt={alt}
        style={{
          width: '45px',
          height: '45px',
          margin: '0px 10px 0px 5px',
          cursor: 'pointer',
          float: 'left',
        }}
      />
    );
  }
}

export default AvatarWithMenu;
