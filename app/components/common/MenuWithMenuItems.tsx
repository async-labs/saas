import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

class MenuWithMenuItems extends React.PureComponent<{
  menuOptions: any;
  itemOptions: any[];
}> {
  state = {
    menuElm: null,
  };

  handleClick = event => {
    event.preventDefault();
    this.setState({ menuElm: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ menuElm: null });
  };

  render() {
    const { menuOptions, itemOptions } = this.props;
    const { menuElm } = this.state;

    return (
      <div style={{ verticalAlign: 'middle' }}>
        <i
          aria-owns={menuElm ? menuOptions.id : null}
          data-id={menuOptions.dataId}
          aria-haspopup="true"
          style={{ fontSize: '13px', opacity: 0.7, cursor: 'pointer' }}
          className="material-icons"
          onClick={e => this.handleClick(e)}
        >
          more_vert
        </i>

        <Menu
          id={menuOptions.id}
          anchorEl={menuElm}
          open={Boolean(menuElm)}
          onClose={this.handleClose}
        >
          {itemOptions.map((option, i) => (
            <MenuItem
              key={option.dataId + i}
              data-id={option.dataId}
              data-more-id={option.dataMoreId}
              onClick={e => {
                this.setState({ menuElm: null });
                option.onClick(e);
              }}
            >
              {option.text}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}

export default MenuWithMenuItems;
