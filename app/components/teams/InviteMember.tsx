import React from 'react';
import Button from 'material-ui/Button';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import { getStore } from '../../lib/store';

const store = getStore();

interface Props {
  onClose: Function;
  open: boolean;
}

interface State {
  email: string;
}

class InviteMember extends React.Component<Props, State> {
  state = {
    email: '',
  };

  handleClose = () => {
    this.setState({ email: '' });
    this.props.onClose();
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      await store.currentTeam.inviteMember(email);

      this.setState({ email: '' });
      notify('Added');
      this.props.onClose();
      NProgress.done();
    } catch (error) {
      console.log(error);
      notify(error);
      this.props.onClose();
      NProgress.done();
    }
  };

  render() {
    const { open } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="invite-memter-dialog-title" open={open}>
        <DialogTitle id="invite-memter-dialog-title">Invite member</DialogTitle>
        <form onSubmit={this.onSubmit}>
          <TextField
            value={this.state.email}
            placeholder="Email"
            onChange={event => {
              this.setState({ email: event.target.value });
            }}
          />

          <Button type="submit" variant="raised" color="primary">
            Invite
          </Button>
        </form>
      </Dialog>
    );
  }
}

export default InviteMember;
