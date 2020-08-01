import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
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
};

class EditDiscussionForm extends React.Component<Props, State> {
  public state = {
    name: '',
    memberIds: [],
    disabled: false,
    discussionId: '',
  };

  public static getDerivedStateFromProps(props: Props, state: State) {
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
    this.setState({ name: '', memberIds: [], disabled: false });
    this.props.onClose();
  };

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { discussion, store } = this.props;
    const { currentTeam } = store;

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

    if (!memberIds || memberIds.length < 1) {
      notify('Please assign at least one person to this Issue.');
      return;
    }

    NProgress.start();
    try {
      await discussion.editDiscussion({ name, memberIds });

      this.setState({ name: '', memberIds: [], disabled: false });
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
