import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';

class MenuWithMenuItems extends React.PureComponent<{
  menuOptions: any;
  itemOptions: any[];
}> {
  public state = {
    menuElem: null,
  };

  public render() {
    const { menuOptions, itemOptions } = this.props;
    const { menuElem } = this.state;

    return (
      <div style={{ verticalAlign: 'middle' }}>
        <i
          aria-controls={menuElem ? menuOptions.id : null}
          data-id={menuOptions.dataId}
          aria-haspopup="true"
          style={{ fontSize: '14px', opacity: 0.7, cursor: 'pointer' }}
          className="material-icons"
          onClick={(e) => this.handleClick(e)}
        >
          more_vert
        </i>

        <Menu
          id={menuOptions.id}
          anchorEl={menuElem}
          open={Boolean(menuElem)}
          onClose={this.handleClose}
        >
          {itemOptions.map((option, i) => (
            <MenuItem
              key={option.dataId + i}
              data-id={option.dataId}
              data-more-id={option.dataMoreId}
              onClick={(e) => {
                this.setState({ menuElem: null });
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
    this.setState({ menuElem: event.currentTarget });
  };

  public handleClose = () => {
    this.setState({ menuElem: null });
  };
}

export default MenuWithMenuItems;
