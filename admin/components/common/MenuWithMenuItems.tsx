import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
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

    return (
      <span>
        <Tooltip
          title={menuOptions.tooltipTitle}
          placement="top"
          disableFocusListener
          disableTouchListener
        >
          <a href="#" style={{ float: 'right' }} onClick={this.handleClick}>
            <i
              data-id={menuOptions.dataId}
              aria-haspopup="true"
              color="action"
              style={{ fontSize: '13px', opacity: 0.7, verticalAlign: 'middle' }}
              className="material-icons"
            >
              more_vert
            </i>
          </a>
        </Tooltip>

        <Menu
          id={menuOptions.id}
          anchorEl={this.state.menuElm}
          open={!!this.state.menuElm}
          onClose={this.handleClose}
        >
          {itemOptions.map((option, i) => (
            <MenuItem
              key={option.dataId + i}
              data-id={option.dataId}
              onClick={e => {
                this.setState({ menuElm: null });
                option.onClick(e);
              }}
            >
              {option.text}
            </MenuItem>
          ))}
        </Menu>
      </span>
    );
  }
}

export default MenuWithMenuItems;
