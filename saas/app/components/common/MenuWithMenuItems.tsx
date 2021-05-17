import Menu from '@material-ui/core/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';

class MenuWithMenuItems extends React.PureComponent<{
  menuOptions: any;
  itemOptions: any[];
}> {
  public state = {
    menuElm: null,
  };

  public render() {
    const { menuOptions, itemOptions } = this.props;
    const { menuElm } = this.state;

    return (
      <div style={{ verticalAlign: 'middle' }}>
        <MoreVertIcon
          aria-controls={menuElm ? menuOptions.id : null}
          data-id={menuOptions.dataId}
          aria-haspopup="true"
          style={{ fontSize: '14px', opacity: 0.7, cursor: 'pointer' }}
          onClick={(e) => this.handleClick(e)}
        />

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
              onClick={(e) => {
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

  public handleClick = (event) => {
    event.preventDefault();
    this.setState({ menuElm: event.currentTarget });
  };

  public handleClose = () => {
    this.setState({ menuElm: null });
  };
}

export default MenuWithMenuItems;
