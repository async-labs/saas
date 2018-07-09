import React from 'react';
import { withRouter } from 'next/router';
import Router from 'next/router';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';

class MenuWithLinks extends React.PureComponent<{
  src?: string;
  alt?: string;
  options: any[];
  router: any;
}> {
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
    const { options, src, alt, children, router } = this.props;
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
                <hr style={{ width: '85%', margin: '10px auto' }} key={`separated-${i}`} />
              ) : (
                <MenuItem
                  onClick={() => {
                    Router.push(option.href, option.as || option.href);
                    this.handleClose();
                  }}
                  key={option.href}
                  style={{
                    fontWeight: router.asPath.includes(option.highlighterSlug) ? 600 : 300,
                    fontSize: '14px',
                  }}
                >
                  {option.avatarUrl ? (
                    <Avatar
                      src={`${option.avatarUrl ||
                        'https://storage.googleapis.com/async-await/async-logo-40.svg'}`}
                      alt="Team logo"
                      style={{
                        margin: '0px 10px 0px 0px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        height: '32px',
                        width: '32px',
                        verticalAlign: 'middle',
                      }}
                    />
                  ) : null}

                  {option.text}
                </MenuItem>
              ),
          )}
        </Menu>
      </div>
    );
  }
}

export default withRouter(MenuWithLinks);
