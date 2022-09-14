import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Link from 'next/link';
import { NextRouter, withRouter } from 'next/router';
import React from 'react';

type Props = {
  options: {
    href: string;
    as: string;
    highlighterSlug: string;
    text: string;
    separator: boolean;
  }[];
  router: NextRouter;
  children: any;
};

type State = {
  anchorEl: Element | ((element: Element) => Element);
};

class MenuWithLinks extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
    };
  }

  public render() {
    const { options, children, router } = this.props;
    const { anchorEl } = this.state;

    return (
      <div style={{ textAlign: 'center' }}>
        <div
          aria-controls={anchorEl ? 'simple-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
          onKeyPress={this.handleClick}
        >
          {children}
        </div>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          keepMounted
        >
          {options.map((option, i) =>
            option.separator ? (
              <hr style={{ width: '85%', margin: '10px auto' }} key={`separated-${i}`} />
            ) : (
              <Link key={option.href} href={option.href} as={option.as} passHref>
                <MenuItem
                  key={option.href}
                  style={{
                    fontWeight: router.asPath.includes(option.highlighterSlug) ? 600 : 300,
                    fontSize: '14px',
                  }}
                >
                  {option.text}
                </MenuItem>
              </Link>
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
