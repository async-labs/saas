import React from 'react';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { inject } from 'mobx-react';
import Router from 'next/router';
import NProgress from 'nprogress';

import MemberChooser from '../users/MemberChooser';
import PostEditor from '../posts/PostEditor';
import notify from '../../lib/notifier';
import { Store } from '../../lib/store';

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
  disabled: boolean;
  content: string;
}

class CreateDiscussionForm extends React.Component<Props, State> {
  state = {
    name: '',
    content: '',
    memberIds: [],
    disabled: false,
  };

  handleClose = () => {
    this.setState({ name: '', content: '', memberIds: [], disabled: false });
    this.props.onClose();
  };

  handleMemberChange = memberIds => {
    this.setState({ memberIds });
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

    const { name, memberIds, content } = this.state;
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
        memberIds,
      });

      await discussion.addPost(content);

      this.setState({ name: '', memberIds: [] });
      notify('You successfully created Discussion');

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
        helperText="These members will see all posts and be notified about unread posts in this Discussion."
        onChange={this.handleMemberChange}
        members={members}
        selectedMemberIds={this.state.memberIds}
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
            </div>
            <p />
            {this.renderMemberChooser()}
            <br />
            <PostEditor
              content={this.state.content}
              onChanged={content => this.setState({ content })}
            />
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
