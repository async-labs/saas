import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import ActiveLink from './ActiveLink';

class MenuWithLinks extends React.PureComponent<{ src?: string; alt?: string; options: any[] }> {
  state = {
    anchorEl: null,
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { options, src, alt, children } = this.props;
    const { anchorEl } = this.state;

    return (
      <div style={{ textAlign: 'center' }}>
        <div
          aria-owns={anchorEl ? 'simple-menu' : null}
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
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {options.map(
            (option, i) =>
              option.separator ? (
                <hr
                  style={{ width: '85%', margin: '20px auto 10px auto' }}
                  key={`separated-${i}`}
                />
              ) : (
                <MenuItem onClick={this.handleClose} key={option.href}>
                  <ActiveLink
                    teamLogo={option.avatarUrl}
                    linkText={option.text}
                    href={option.href}
                    as={option.as || option.href}
                    simple={option.simple}
                    highlighterSlug={option.highlighterSlug}
                  />
                </MenuItem>
              ),
          )}
        </Menu>
      </div>
    );
  }
}

export default MenuWithLinks;
