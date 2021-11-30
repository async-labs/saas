import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

export let openConfirmDialogExternal;

type State = {
  open: boolean;
  title: string;
  message: string;
  onAnswer: (answer) => void;
};

class Confirmer extends React.Component<any, State> {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      title: 'Are you sure?',
      message: '',
      onAnswer: null,
    };

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
