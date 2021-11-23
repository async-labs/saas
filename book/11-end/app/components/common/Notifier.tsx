import Snackbar from '@material-ui/core/Snackbar';
import React from 'react';

export let openSnackbarExternal;

type State = {
  open: boolean;
  message: string;
};

class Notifier extends React.PureComponent<any, State> {
  constructor(props) {
    super(props);
    openSnackbarExternal = this.openSnackbar;

    this.state = {
      open: false,
      message: '',
    };
  }

  public render() {
    const message = (
      <span id="snackbar-message-id" dangerouslySetInnerHTML={{ __html: this.state.message }} />
    );

    return (
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        message={message}
        autoHideDuration={5000}
        onClose={this.handleSnackbarClose}
        open={this.state.open}
        ContentProps={{
          'aria-describedby': 'snackbar-message-id',
        }}
      />
    );
  }

  public handleSnackbarClose = () => {
    this.setState({
      open: false,
      message: '',
    });
  };

  public openSnackbar = ({ message }) => {
    this.setState({ open: true, message });
  };
}

export default Notifier;
