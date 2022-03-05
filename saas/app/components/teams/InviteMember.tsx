import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { inject, observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';

import notify from '../../lib/notify';
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
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      disabled: false,
    };
  }

  public render() {
    const { open } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="invite-member-dialog-title" open={open}>
        <DialogTitle id="invite-member-dialog-title">Invite member</DialogTitle>
        <DialogContent>
          <form onSubmit={this.onSubmit} style={{ padding: '20px' }}>
            <TextField
              disabled
              autoComplete="off"
              value={this.state.email}
              placeholder="Email"
              onChange={(event) => {
                this.setState({ email: event.target.value });
              }}
            />
            <p>Disabled in this demo due to high bounce rate (people submitting fake emails)</p>
            <br />
            <Button variant="outlined" onClick={this.handleClose} disabled={this.state.disabled}>
              Cancel
            </Button>{' '}
            <Button disabled type="submit" variant="contained" color="primary">
              Invite
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  private handleClose = () => {
    this.setState({ email: '', disabled: false });
    this.props.onClose();
  };

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      await store.currentTeam.inviteMember(email);

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
