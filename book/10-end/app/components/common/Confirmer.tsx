import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

export let openConfirmDialogExternal;

class Confirmer extends React.Component {
  public state = {
    open: false,
    title: 'Are you sure?',
    message: '',
    onAnswer: null,
  };

  constructor(props) {
    super(props);
    openConfirmDialogExternal = this.openConfirmDialog;
  }

  public render() {
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
          <Button onClick={this.handleClose} variant="contained" color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={this.handleYes} variant="contained" color="secondary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  public handleClose = () => {
    this.setState({ open: false });
    this.state.onAnswer(false);
  };

  public handleYes = () => {
    this.setState({ open: false });
    this.state.onAnswer(true);
  };

  public openConfirmDialog = ({ title, message, onAnswer }) => {
    this.setState({ open: true, title, message, onAnswer });
  };
}

export default Confirmer;
