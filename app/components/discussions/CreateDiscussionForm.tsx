import React from 'react';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { inject } from 'mobx-react';
import Router from 'next/router';

import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import { Store } from '../../lib/store';
import AutoComplete from '../common/AutoComplete';
import PostEditor from '../posts/PostEditor';

const styles = {
  paper: {
    width: '100%',
    padding: '0px 20px 20px 20px',
  },
};

interface Props {
  store?: Store;
  onClose: Function;
  open: boolean;
  classes: { paper: string };
}

interface State {
  name: string;
  memberIds: string[];
  privacy: string;
  disabled: boolean;
  content: string;
}

class CreateDiscussionForm extends React.Component<Props, State> {
  state = {
    name: '',
    content: '',
    memberIds: [],
    privacy: 'public',
    disabled: false,
  };

  handleClose = () => {
    this.setState({ name: '', content: '', memberIds: [], privacy: 'public', disabled: false });
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

    const { store } = this.props;
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

    const { name, memberIds, privacy, content } = this.state;
    const isPrivate = privacy === 'private';
    if (!name) {
      notify('Name is required');
      return;
    }

    if (!content) {
      notify('Content is required');
      return;
    }

    NProgress.start();
    try {
      this.setState({ disabled: true });

      const discussion = await currentTopic.addDiscussion({
        name,
        memberIds: isPrivate ? memberIds : [],
        isPrivate,
      });

      await discussion.addPost(content);

      this.setState({ name: '', memberIds: [], privacy: 'public' });
      notify('You successfully created Discussion.');

      Router.push(
        `/discussions/detail?teamSlug=${currentTeam.slug}&topicSlug=${
          currentTopic.slug
        }&discussionSlug=${discussion.slug}`,
        `/team/${currentTeam.slug}/t/${currentTopic.slug}/d/${discussion.slug}`,
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
    const { store } = this.props;
    const { currentUser } = store;
    const memberIds: string[] = [];

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
    const {
      open,
      classes: { paper },
    } = this.props;

    return (
      <Drawer
        anchor="right"
        open={open}
        classes={{ paper }}
        transitionDuration={{ enter: 500, exit: 500 }}
      >
        <div style={{ width: '100%', height: '100%', padding: '20px' }}>
          <h3>Create new Discussion</h3>
          <div style={{ float: 'right' }}>
            <Button variant="outlined" onClick={this.handleClose} disabled={this.state.disabled}>
              Cancel
            </Button>
          </div>
          <form style={{ width: '100%', height: '60%' }} onSubmit={this.onSubmit}>
            <div>
              <TextField
                autoFocus
                label="Type name of Discussion"
                helperText="Give a short and informative name to new Discussion"
                value={this.state.name}
                onChange={event => {
                  this.setState({ name: event.target.value });
                }}
              />
              <p />
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
            <PostEditor
              content={this.state.content}
              onChanged={content => this.setState({ content })}
            />
            <p />

            {this.state.privacy === 'private' ? this.renderAutoComplete() : null}
            <br />
            <div style={{ float: 'right' }}>
              <Button type="submit" variant="raised" color="primary" disabled={this.state.disabled}>
                Create Discussion
              </Button>
              <br />
              <br />
            </div>
          </form>
        </div>
      </Drawer>
    );
  }
}

export default withStyles(styles)(inject('store')(CreateDiscussionForm));
