import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { inject } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';

import notify from '../../lib/notifier';
import { Discussion, Store } from '../../lib/store';
import MemberChooser from '../users/MemberChooser';

type Props = {
  store?: Store;
  onClose: () => void;
  open: boolean;
  discussion: Discussion;
  isMobile: boolean;
};

type State = {
  name: string;
  memberIds: string[];
  disabled: boolean;
  discussionId: string;
  notificationType: string;
};

class EditDiscussionForm extends React.Component<Props, State> {
  public static getDerivedStateFromProps(props: Props, state: State) {
    const { discussion } = props;

    if (state.discussionId === discussion._id) {
      return null;
    }

    return {
      name: (discussion && discussion.name) || '',
      memberIds: (discussion && discussion.memberIds) || [],
      discussionId: discussion._id,
      notificationType: discussion.notificationType || 'default',
    };
  }

  public state = {
    name: '',
    memberIds: [],
    disabled: false,
    discussionId: '',
    notificationType: 'default',
  };

  public render() {
    const { open } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Edit Discussion</DialogTitle>
        <DialogContent>
          <DialogContentText>Explain discussion</DialogContentText>
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
            <p />
            <br />
            <FormControl>
              <InputLabel>Notification type</InputLabel>
              <Select
                value={this.state.notificationType}
                onChange={event => {
                  this.setState({ notificationType: event.target.value });
                }}
                required
              >
                <MenuItem value="default">Default: notification in browser tab.</MenuItem>
                <MenuItem value="email">
                  Default + Email: notification in browser tab and via email.
                </MenuItem>
              </Select>
              <FormHelperText>
                Choose how to notify members about new Posts inside Discussion.
              </FormHelperText>
            </FormControl>
            <p />
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={this.state.disabled}
              >
                Update Discussion
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  public handleClose = () => {
    this.setState({ name: '', memberIds: [], disabled: false });
    this.props.onClose();
  };

  public handleMembersChange = memberIds => {
    this.setState({ memberIds });
  };

  public onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { discussion, store } = this.props;
    const { currentTeam } = store;

    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { name, memberIds, notificationType } = this.state;

    if (!name) {
      notify('Please name this Discussion.');
      return;
    }

    if (memberIds && !memberIds.includes(discussion.store.currentUser._id)) {
      memberIds.push(discussion.store.currentUser._id);
    }

    // if (!memberIds || memberIds.length < 1) {
    //   notify('Please assign at least one person to this Issue.');
    //   return;
    // }

    if (!notificationType) {
      notify('Please select notification type.');
      return;
    }

    NProgress.start();
    try {
      await discussion.edit({ name, memberIds, notificationType });

      this.setState({ name: '', memberIds: [], disabled: false, notificationType: 'default' });
      notify('You successfully edited Discussion.');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();

      this.props.onClose();
    }
  };

  public renderMemberChooser() {
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
}

export default inject('store')(EditDiscussionForm);
