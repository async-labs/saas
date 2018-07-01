import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import { inject } from 'mobx-react';
import NProgress from 'nprogress';

import MemberChooser from '../users/MemberChooser';
import notify from '../../lib/notifier';
import { Store, Discussion } from '../../lib/store';

interface Props {
  store?: Store;
  onClose: Function;
  open: boolean;
  discussion: Discussion;
}

interface State {
  name: string;
  memberIds: string[];
  disabled: boolean;
  discussionId: string;
}

class EditDiscussionForm extends React.Component<Props, State> {
  state = {
    name: '',
    memberIds: [],
    disabled: false,
    discussionId: '',
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    const { discussion } = props;

    if (state.discussionId === discussion._id) {
      return null;
    }

    return {
      name: (discussion && discussion.name) || '',
      memberIds: (discussion && discussion.memberIds) || [],
      discussionId: discussion._id,
    };
  }

  handleClose = () => {
    this.setState({ name: '', memberIds: [], disabled: false });
    this.props.onClose();
  };

  handleMembersChange = memberIds => {
    this.setState({ memberIds });
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { discussion, store } = this.props;
    const { currentTeam } = store;
    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { currentTopic } = currentTeam;
    if (!currentTopic) {
      notify('Topic have not selected');
      return;
    }

    const { name, memberIds } = this.state;
    if (!name) {
      notify('Name is required');
      return;
    }

    NProgress.start();
    try {
      this.setState({ disabled: true });

      await discussion.edit({ name, memberIds });

      this.setState({ name: '', memberIds: [] });
      notify('You successfully edited Discussion');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();

      this.props.onClose();
    }
  };

  renderMemberChooser() {
    const { store } = this.props;
    const { currentUser } = store;

    const members = Array.from(store.currentTeam.members.values()).filter(
      user => user._id !== currentUser._id,
    );

    return (
      <MemberChooser
        helperText="These members will see all posts and be notified about unread posts in this discussion."
        onChange={this.handleMembersChange}
        members={members}
        selectedMemberIds={this.state.memberIds}
      />
    );
  }

  render() {
    const { open } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Edit Discussion</DialogTitle>
        <DialogContent>
          <DialogContentText>Explain discussion</DialogContentText>
          <hr />
          <br />
          <form onSubmit={this.onSubmit}>
            <TextField
              label="Type name of Discussion"
              helperText="Give a short and informative name to Discussion"
              value={this.state.name}
              onChange={event => {
                this.setState({ name: event.target.value });
              }}
            />
            <br />
            <p />
            {this.renderMemberChooser()}
            <br />
            <DialogActions>
              <Button
                color="primary"
                variant="outlined"
                onClick={this.handleClose}
                disabled={this.state.disabled}
              >
                Cancel
              </Button>
              <Button type="submit" variant="raised" color="primary" disabled={this.state.disabled}>
                Update Discussion
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

export default inject('store')(EditDiscussionForm);
