import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { NextRouter, withRouter } from 'next/router';
import Router from 'next/router';
import React from 'react';

class MenuWithLinks extends React.PureComponent<{
  src?: string;
  alt?: string;
  options: any[];
  router: NextRouter;
}> {
  public state = {
    anchorEl: null,
  };

  public render() {
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
          {options.map((option, i) =>
            option.separator ? (
              <hr style={{ width: '85%', margin: '10px auto' }} key={`separated-${i}`} />
            ) : (
              <MenuItem
                onClick={() => {
                  if (option.external) {
                    window.location.href = option.href;
                  } else {
                    Router.push(option.href, option.as || option.href);
                  }
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

  public handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  public handleClose = () => {
    this.setState({ anchorEl: null });
  };
}

export default withRouter(MenuWithLinks);
