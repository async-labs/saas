import React from 'react';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText } from 'material-ui/Dialog';

let openConfirmDialogFn;

class Confirm extends React.Component {
  state = {
    open: false,
    message: 'Are you sure?',
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

  openConfirmDialog = ({ message, onAnswer }) => {
    this.setState({ open: true, message, onAnswer });
  };

  render() {
    return (
      <Dialog
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{this.state.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleYes} color="primary">
            OK
          </Button>
          <Button onClick={this.handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export function openConfirmDialog({ message, onAnswer }: { message: string; onAnswer: Function }) {
  openConfirmDialogFn({ message, onAnswer });
}

export default Confirm;
