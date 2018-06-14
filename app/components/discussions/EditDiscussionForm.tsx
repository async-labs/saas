import React from 'react';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import { inject } from 'mobx-react';

import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import { Store, Discussion } from '../../lib/store';
import AutoComplete from '../common/AutoComplete';

interface Props {
  store?: Store;
  onClose: Function;
  open: boolean;
  discussion: Discussion;
}

interface State {
  name: string;
  memberIds: string[];
  privacy: string;
  disabled: boolean;
  discussionId: string;
}

@inject('store')
class DiscussionForm extends React.Component<Props, State> {
  state = {
    name: '',
    memberIds: [],
    privacy: 'public',
    disabled: false,
    discussionId: '',
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    const { discussion } = props;

    if (state.discussionId === discussion._id) {
      return;
    }

    return {
      name: (discussion && discussion.name) || '',
      memberIds: (discussion && discussion.memberIds) || [],
      privacy: discussion && discussion.isPrivate ? 'private' : 'public',
      discussionId: discussion._id,
    };
  }

  handleClose = () => {
    this.setState({ name: '', memberIds: [], privacy: 'public', disabled: false });
    this.props.onClose();
  };

  handlePrivacyChange = event => {
    this.setState({ privacy: event.target.value });
  };

  handleAutoCompleteChange = selectedItems => {
    this.setState({ memberIds: selectedItems.map(i => i.value) });
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

    const { name, memberIds, privacy } = this.state;
    const isPrivate = privacy === 'private';
    if (!name) {
      notify('Name is required');
      return;
    }

    NProgress.start();
    try {
      this.setState({ disabled: true });

      await discussion.edit({ name, memberIds: isPrivate ? memberIds : [], isPrivate });

      this.setState({ name: '', memberIds: [], privacy: 'public' });
      notify('You successfully edited Discussion');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.props.onClose();
      NProgress.done();
      this.setState({ disabled: false });
    }
  };

  renderAutoComplete() {
    const { discussion, store } = this.props;
    const { currentUser } = store;
    const memberIds: string[] = (discussion && discussion.memberIds) || [];

    const suggestions = Array.from(store.currentTeam.members.values())
      .filter(user => user._id !== currentUser._id)
      .map(user => ({
        label: user.displayName,
        value: user._id,
      }));

    const selectedItems = suggestions.filter(s => memberIds.indexOf(s.value) !== -1);

    return (
      <AutoComplete
        label="Type name of Team Member"
        helperText="These members will see all posts and be notified about unread posts in this discussion."
        onChange={this.handleAutoCompleteChange}
        suggestions={suggestions}
        selectedItems={selectedItems}
      />
    );
  }

  render() {
    const { open, discussion } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Edit Discussion</DialogTitle>
        <DialogContent>
          <DialogContentText>Explain discussion</DialogContentText>
          <hr />
          <TextField
            label="Type name of Discussion"
            value={this.state.name}
            onChange={event => {
              this.setState({ name: event.target.value });
            }}
          />
          <br />
          <form onSubmit={this.onSubmit}>
            <div>
              <br />
              <FormControl component="fieldset">
                <FormLabel component="legend">Privacy setting:</FormLabel>
                <RadioGroup
                  aria-label="privacy"
                  name="privacy"
                  value={this.state.privacy}
                  onChange={this.handlePrivacyChange}
                >
                  <FormControlLabel value="public" control={<Radio />} label="Public" />
                  <FormControlLabel value="private" control={<Radio />} label="Private" />
                </RadioGroup>
              </FormControl>
            </div>
            <br />

            {this.state.privacy === 'private' ? this.renderAutoComplete() : null}
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

export default DiscussionForm;
