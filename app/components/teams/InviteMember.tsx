import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { inject, observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';

import notify from '../../lib/notifier';
import { Store } from '../../lib/store';

type Props = {
  store: Store;
  onClose: () => void;
  open: boolean;
};

type State = {
  email: string;
  disabled: boolean;
};

class InviteMember extends React.Component<Props, State> {
  public state = {
    email: '',
    disabled: false,
  };

  public render() {
    const { open } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="invite-memter-dialog-title" open={open}>
        <DialogTitle id="invite-memter-dialog-title">Invite member</DialogTitle>
        <form onSubmit={this.onSubmit} style={{ padding: '20px' }}>
          <TextField
            autoFocus
            value={this.state.email}
            placeholder="Email"
            onChange={event => {
              this.setState({ email: event.target.value });
            }}
          />
          <p />
          <Button variant="outlined" onClick={this.handleClose} disabled={this.state.disabled}>
            Cancel
          </Button>{' '}
          <Button type="submit" variant="contained" color="primary" disabled={this.state.disabled}>
            Invite
          </Button>
        </form>
      </Dialog>
    );
  }

  public handleClose = () => {
    this.setState({ email: '', disabled: false });
    this.props.onClose();
  };

  public onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { store } = this.props;

    if (!store.currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { email } = this.state;

    if (!email) {
      notify('Email is required');
      return;
    }

    NProgress.start();
    try {
      this.setState({ disabled: true });
      await store.currentTeam.inviteMember({ email });

      this.setState({ email: '' });
      notify('You successfully sent invitation.');
      NProgress.done();
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.props.onClose();
      this.setState({ disabled: false });
      NProgress.done();
    }
  };
}

export default inject('store')(observer(InviteMember));
