import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel } from 'material-ui/Form';

import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import { getStore, Discussion } from '../../lib/store';
import AutoComplete from '../common/AutoComplete';

const store = getStore();

interface Props {
  onClose: Function;
  open: boolean;
  discussion?: Discussion;
}

interface State {
  name: string;
  memberIds: string[];
}

class DiscussionForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { discussion } = props;

    this.state = {
      name: (discussion && discussion.name) || '',
      memberIds: (discussion && discussion.memberIds) || [],
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { discussion } = nextProps;

    return {
      name: (discussion && discussion.name) || '',
      memberIds: (discussion && discussion.memberIds) || [],
    };
  }

  handleClose = () => {
    this.setState({ name: '', memberIds: [] });
    this.props.onClose();
  };

  handleAutoCompleteChange = selectedItems => {
    this.setState({ memberIds: selectedItems.map(i => i.value) });
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { discussion } = this.props;
    const { name, memberIds } = this.state;
    if (!name) {
      notify('Name is required');
      return;
    }

    if (discussion) {
      NProgress.start();
      try {
        await discussion.edit({ name, memberIds });

        this.setState({ name: '', memberIds: [] });
        notify('Edited');
        this.props.onClose();
        NProgress.done();
      } catch (error) {
        console.log(error);
        notify(error);
        this.props.onClose();
        NProgress.done();
      }

      return;
    }

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

    NProgress.start();
    try {
      await currentTopic.addDiscussion({ name, memberIds });

      this.setState({ name: '', memberIds: [] });
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

  renderAutoComplete() {
    const { discussion } = this.props;
    const memberIds: string[] = (discussion && discussion.memberIds) || [];

    const suggestions = Array.from(store.currentTeam.members.values()).map(user => ({
      label: user.displayName,
      value: user._id,
    }));

    const selectedItems = suggestions.filter(s => memberIds.indexOf(s.value) !== -1);

    return (
      <AutoComplete
        placeholder="Start typing person's name"
        helperText="Only selected people will be notified"
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
          {discussion ? 'Edit discussion' : 'Add new discussion'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Explain this feature briefly.</DialogContentText>
          <hr />
          <br />
          <form onSubmit={this.onSubmit}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Notify people:</FormLabel>
              <RadioGroup
                aria-label="privacy"
                name="privacy"
                value={this.state.privacy}
                onChange={this.handlePrivacyChange}
              >
                <FormControlLabel
                  value="private"
                  control={<Radio />}
                  label="Select people manually"
                />
                <FormControlLabel
                  value="public"
                  control={<Radio />}
                  label="Add all people in this topic"
                />
              </RadioGroup>
            </FormControl>
            <p />
            <TextField
              value={this.state.name}
              placeholder="Name"
              onChange={event => {
                this.setState({ name: event.target.value });
              }}
            />
            <p />
            <br />
            {this.renderAutoComplete()}
            <br />
            <DialogActions>
              <Button type="submit" variant="raised" color="primary">
                {discussion ? 'Save' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

export default DiscussionForm;
