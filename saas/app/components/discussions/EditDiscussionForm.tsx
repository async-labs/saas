import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';

import notify from '../../lib/notify';
import { Store } from '../../lib/store';
import { Discussion } from '../../lib/store/discussion';
import MemberChooser from '../common/MemberChooser';

type Props = {
  store: Store;
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
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      memberIds: [],
      disabled: false,
      discussionId: '',
      notificationType: 'default',
    };
  }

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

  public render() {
    const { open, store } = this.props;
    const { currentTeam, currentUser } = store;

    const membersMinusCreator = Array.from(currentTeam.members.values()).filter(
      (user) => user._id !== currentUser._id,
    );

    // console.log(currentTeam.members);

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Edit Discussion</DialogTitle>
        <DialogContent>
          <DialogContentText>Edit discussion</DialogContentText>
          <br />
          <form onSubmit={this.onSubmit}>
            <TextField
              label="Type name of Discussion"
              helperText="Give a short and informative name to Discussion"
              value={this.state.name}
              onChange={(event) => {
                this.setState({ name: event.target.value });
              }}
            />
            <br />
            <p />
            <MemberChooser
              helperText="These members will see all posts and be notified about unread posts in this discussion."
              onChange={this.handleMembersChange}
              members={membersMinusCreator}
              selectedMemberIds={this.state.memberIds}
            />
            <p />
            <br />
            <FormControl>
              <Select
                value={this.state.notificationType}
                onChange={(event) => {
                  event.stopPropagation();
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

  public handleMembersChange = (memberIds) => {
    this.setState({ memberIds });
  };

  public handleClose = () => {
    this.setState({ name: '', memberIds: [], disabled: false, notificationType: 'default' });
    this.props.onClose();
  };

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { discussion, store } = this.props;
    const { currentTeam } = store;
    const { notificationType } = this.state;

    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { name, memberIds } = this.state;

    if (!name) {
      notify('Please name this Discussion.');
      return;
    }

    if (memberIds && !memberIds.includes(discussion.store.currentUser._id)) {
      memberIds.push(discussion.store.currentUser._id);
    }

    // if (!memberIds || memberIds.length < 1) {
    //   notify('Please assign at least one person to this Discussion.');
    //   return;
    // }

    if (!notificationType) {
      notify('Please select notification type.');
      return;
    }

    NProgress.start();
    try {
      await discussion.editDiscussion({ name, memberIds, notificationType });

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
}

export default observer(EditDiscussionForm);
