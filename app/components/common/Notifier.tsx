import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

let openSnackbarFn;

class Notifier extends React.PureComponent {
  state = {
    open: false,
    message: '',
  };

  componentDidMount() {
    openSnackbarFn = this.openSnackbar;
  }

  handleSnackbarClose = () => {
    this.setState({
      open: false,
      message: '',
    });
  };

  openSnackbar = ({ message }) => {
    this.setState({ open: true, message });
  };

  render() {
    const message = (
      <span id="snackbar-message-id" dangerouslySetInnerHTML={{ __html: this.state.message }} />
    );

    return (
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        message={message}
        autoHideDuration={3000}
        onClose={this.handleSnackbarClose}
        open={this.state.open}
        ContentProps={{
          'aria-describedby': 'snackbar-message-id',
        }}
      />
    );
  }
}

export function openSnackbar({ message }) {
  openSnackbarFn({ message });
}

export default Notifier;
