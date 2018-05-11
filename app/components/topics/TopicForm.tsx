import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  withMobileDialog,
} from 'material-ui/Dialog';
import Radio, { RadioGroup } from 'material-ui/Radio';
import NProgress from 'nprogress';
import { FormLabel, FormControl, FormControlLabel } from 'material-ui/Form';
import TextField from 'material-ui/TextField';

import notify from '../../lib/notifier';
import { getStore, Topic } from '../../lib/store';
import AutoComplete from '../common/AutoComplete';

const store = getStore();

interface Props {
  onClose: Function;
  open: boolean;
  topic?: Topic;
  fullScreen: boolean;
}

interface State {
  name: string;
  privacy: string;
  memberIds: string[];
}

class TopicForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { topic } = props;

    this.state = {
      name: (topic && topic.name) || '',
      privacy: (topic && topic.isPrivate && 'public') || 'private',
      memberIds: (topic && topic.memberIds) || [],
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { topic } = nextProps;

    return {
      name: (topic && topic.name) || '',
      privacy: (topic && topic.isPrivate && 'public') || 'private',
      memberIds: (topic && topic.memberIds) || [],
    };
  }

  handleClose = () => {
    this.setState({ privacy: 'public', name: '', memberIds: [] });
    this.props.onClose();
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!store.currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { topic } = this.props;
    const { name, privacy, memberIds } = this.state;

    if (!name) {
      notify('Name is required');
      return;
    }

    if (topic) {
      NProgress.start();
      try {
        await topic.edit({
          name,
          isPrivate: privacy === 'private',
          memberIds,
        });

        notify('Saved successfully.');
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

    NProgress.start();
    try {
      await store.currentTeam.addTopic({
        name,
        isPrivate: privacy === 'private',
        memberIds,
      });

      this.setState({ privacy: 'public', name: '', memberIds: [] });
      notify('Added successfully.');
      this.props.onClose();
      NProgress.done();
    } catch (error) {
      console.log(error);
      notify(error);
      this.props.onClose();
      NProgress.done();
    }
  };

  handlePrivacyChange = event => {
    this.setState({ privacy: event.target.value });
  };

  handleAutoCompleteChange = selectedItems => {
    this.setState({ memberIds: selectedItems.map(i => i.value) });
  };

  renderAutoComplete() {
    const { topic } = this.props;
    const memberIds: string[] = (topic && topic.memberIds) || [];

    const suggestions = Array.from(store.currentTeam.members.values()).map(user => ({
      label: user.displayName,
      value: user._id,
    }));

    const selectedItems = suggestions.filter(s => memberIds.indexOf(s.value) !== -1);

    return (
      <AutoComplete
        placeholder="Start typing person's name"
        helperText="Topic will be only visible to selected people"
        onChange={this.handleAutoCompleteChange}
        suggestions={suggestions}
        selectedItems={selectedItems}
      />
    );
  }

  render() {
    const { open, topic, fullScreen } = this.props;

    return (
      <Dialog
        onClose={this.handleClose}
        aria-labelledby="simple-dialog-title"
        open={open}
        fullScreen={fullScreen}
      >
        <DialogTitle id="simple-dialog-title">
          {topic ? 'Edit Topic' : 'Add Public Topic'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Explain this feature briefly.</DialogContentText>
          <hr />
          <br />
          <form onSubmit={this.onSubmit}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Add people to the topic:</FormLabel>
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
                <FormControlLabel value="public" control={<Radio />} label="Add all team members" />
              </RadioGroup>
            </FormControl>
            <p />
            <TextField
              helperText="Give an informative name to the topic"
              value={this.state.name}
              placeholder="Name of topic"
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
                {topic ? 'Save' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withMobileDialog()(TopicForm);
