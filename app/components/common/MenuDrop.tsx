import React from 'react';
import Link from 'next/link';
import Menu from 'material-ui/Menu';
import Avatar from 'material-ui/Avatar';

class MenuDrop extends React.PureComponent<{ src?: string; alt?: string; options: any[] }> {
  state = {
    open: false,
    anchorEl: undefined,
  };

  button = undefined;

  handleClick = event => {
    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { options, src, alt, children } = this.props;

    return (
      <div>
        <div
          aria-owns="simple-menu"
          aria-haspopup="true"
          onClick={this.handleClick}
          onKeyPress={this.handleClick}
        >
          {children || (
            <Avatar
              role="presentation"
              src={src}
              alt={alt}
              style={{ margin: '0px 20px 0px auto', cursor: 'pointer' }}
            />
          )}
        </div>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onClose={this.handleClose}
        >
          <p />
          {options.map(option => (
            <div id="wrappingLink" key={option.text}>
              <Link prefetch={!option.noPrefetch} href={option.href} as={option.as || option.href}>
                <a style={{ padding: '0px 20px' }}>{option.text}</a>
              </Link>
              <p />
            </div>
          ))}
        </Menu>
      </div>
    );
  }
}

export default MenuDrop;
