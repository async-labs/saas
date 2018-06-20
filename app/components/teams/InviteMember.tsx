import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import NProgress from 'nprogress';
import { inject, observer } from 'mobx-react';

import notify from '../../lib/notifier';
import { Store } from '../../lib/store';

interface Props {
  store: Store;
  onClose: Function;
  open: boolean;
}

interface State {
  email: string;
  disabled: boolean;
}

@inject('store')
@observer
class InviteMember extends React.Component<Props, State> {
  state = {
    email: '',
    disabled: false,
  };

  handleClose = () => {
    this.setState({ email: '', disabled: false });
    this.props.onClose();
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      this.props.onClose();
      NProgress.done();
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      NProgress.done();
      this.setState({ disabled: false });
    }
  };

  render() {
    const { open } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="invite-memter-dialog-title" open={open}>
        <DialogTitle id="invite-memter-dialog-title">Invite member</DialogTitle>
        <form onSubmit={this.onSubmit} style={{ padding: '20px' }}>
          <TextField
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
          <Button type="submit" variant="raised" color="primary" disabled={this.state.disabled}>
            Invite
          </Button>
        </form>
      </Dialog>
    );
  }
}

export default InviteMember;
