import React from 'react';
import Button from '@material-ui/core/Button';
import {
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';
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
  discussion?: Discussion;
}

interface State {
  name: string;
  memberIds: string[];
  privacy: string;
  disabled: boolean;
}

@inject('store')
class DiscussionForm extends React.Component<Props, State> {
  state = {
    name: '',
    memberIds: [],
    privacy: 'public',
    disabled: false,
  };

  static getDerivedStateFromProps(nextProps) {
    const { discussion } = nextProps;

    return {
      name: (discussion && discussion.name) || '',
      memberIds: (discussion && discussion.memberIds) || [],
      privacy: (discussion && discussion.isPrivate) ? 'private' : 'public',
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

      if (discussion) {
        await discussion.edit({ name, memberIds: isPrivate ? memberIds : [], isPrivate });
      } else {
        await currentTopic.addDiscussion({
          name,
          memberIds: isPrivate ? memberIds : [],
          isPrivate,
        });
      }

      this.setState({ name: '', memberIds: [], privacy: 'public' });
      notify(
        discussion ? 'You successfully edited Discussion' : 'You successfully created Discussion',
      );
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
        <DialogTitle id="simple-dialog-title">
          {discussion ? 'Edit Discussion' : 'Create Discussion'}
        </DialogTitle>
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
                {discussion ? 'Update Discussion' : 'Create Discussion'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

export default DiscussionForm;
