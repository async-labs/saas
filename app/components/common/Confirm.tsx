import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

let openConfirmDialogFn;

class Confirm extends React.Component {
  state = {
    open: false,
    title: 'Are you sure?',
    message: '',
    successMessage: '',
    onAnswer: a => a,
  };

  componentDidMount() {
    openConfirmDialogFn = this.openConfirmDialog;
  }

  handleClose = () => {
    this.setState({ open: false });
    this.state.onAnswer(false);
  };

  handleYes = () => {
    this.setState({ open: false });
    this.state.onAnswer(true);
  };

  openConfirmDialog = ({ title, message, onAnswer }) => {
    this.setState({ open: true, title, message, onAnswer });
  };

  render() {
    return (
      <Dialog
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{this.state.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{this.state.message}</DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: '10px' }}>
          <Button onClick={this.handleClose} variant="outlined" color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={this.handleYes} variant="raised" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export function openConfirmDialog({
  title,
  message,
  onAnswer,
}: {
  title: string;
  message: string;
  onAnswer: Function;
}) {
  openConfirmDialogFn({ title, message, onAnswer });
}

export default Confirm;
