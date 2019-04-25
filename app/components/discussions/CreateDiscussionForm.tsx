import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { inject } from 'mobx-react';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import React from 'react';

import notify from '../../lib/notifier';
import { Store } from '../../lib/store';
import PostEditor from '../posts/PostEditor';
import MemberChooser from '../users/MemberChooser';

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_APP } = process.env;
const URL_APP = dev ? 'http://localhost:3000' : PRODUCTION_URL_APP;

const styles = {
  paper: {
    width: '100%',
    padding: '0px 20px 20px 20px',
  },
};

type Props = {
  store?: Store;
  onClose: () => void;
  open: boolean;
  classes: { paper: string };
  isMobile: boolean;
};

type State = {
  name: string;
  memberIds: string[];
  disabled: boolean;
  content: string;
  notificationType: string;
};

class CreateDiscussionForm extends React.Component<Props, State> {
  public state = {
    name: '',
    content: '',
    memberIds: [],
    disabled: false,
    notificationType: 'default',
  };

  public handleClose = () => {
    this.setState({ name: '', content: '', memberIds: [], disabled: false });
    this.props.onClose();
  };

  public render() {
    const {
      open,
      classes: { paper },
      store,
      isMobile,
    } = this.props;

    return (
      <React.Fragment>
        {open ? (
          <Head>
            <title>New Discussion</title>
            <meta name="description" content="Create new discussion" />
          </Head>
        ) : null}
        <Drawer
          anchor="right"
          open={open}
          classes={{ paper }}
          transitionDuration={{ enter: 500, exit: 500 }}
        >
          <div style={{ width: '100%', height: '100%', padding: '20px' }}>
            <h3>Create new Discussion</h3>
            <form style={{ width: '100%', height: '60%' }} onSubmit={this.onSubmit}>
              <p />
              <br />
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
              <div>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={this.state.disabled}
                >
                  Create Discussion
                </Button>
                {isMobile ? <p /> : null}
                <Button
                  variant="outlined"
                  onClick={this.handleClose}
                  disabled={this.state.disabled}
                  style={{ marginLeft: isMobile ? '0px' : '20px' }}
                >
                  Cancel
                </Button>{' '}
              </div>
              <p />
              <PostEditor
                content={this.state.content}
                onChanged={content => this.setState({ content })}
                members={Array.from(store.currentTeam.members.values())}
              />
              <p />
              <div>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={this.state.disabled}
                >
                  Create Discussion
                </Button>
                {isMobile ? <p /> : null}
                <Button
                  variant="outlined"
                  onClick={this.handleClose}
                  disabled={this.state.disabled}
                  style={{ marginLeft: isMobile ? '0px' : '20px' }}
                >
                  Cancel
                </Button>{' '}
                <p />
                <br />
                <br />
              </div>
            </form>
          </div>
        </Drawer>
      </React.Fragment>
    );
  }

  public handleMemberChange = memberIds => {
    this.setState({ memberIds });
  };

  public onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { store } = this.props;
    const { currentTeam } = store;
    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { name, memberIds, content, notificationType } = this.state;

    if (!name) {
      notify('Name is required');
      return;
    }

    if (!content) {
      notify('Content is required');
      return;
    }

    if (!notificationType) {
      notify('Please select notification type.');
      return;
    }

    // if (!memberIds || memberIds.length < 1) {
    //   notify('Please assign at least one person to this Discussion.');
    //   return;
    // }
    this.setState({ disabled: true });
    NProgress.start();

    try {
      const discussion = await currentTeam.addDiscussion({
        name,
        memberIds,
        notificationType,
      });

      // await discussion.addPost(content);

      const post = await discussion.addPost(content);

      if (discussion.notificationType === 'email') {
        const userIdsForLambda = discussion.memberIds.filter(m => m !== discussion.createdUserId);
        console.log(discussion.notificationType, userIdsForLambda);
        await discussion.sendDataToLambdaApiMethod({
          discussionName: discussion.name,
          discussionLink: `${URL_APP}/team/${discussion.team.slug}/discussions/${discussion.slug}`,
          postContent: post.content,
          authorName: post.user.displayName,
          userIds: userIdsForLambda,
        });
      }

      this.setState({ name: '', memberIds: [], content: '' });
      notify('You successfully added new Discussion.');

      Router.push(
        `/discussion?teamSlug=${currentTeam.slug}&discussionSlug=${discussion.slug}`,
        `/team/${currentTeam.slug}/discussions/${discussion.slug}`,
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

  public renderMemberChooser() {
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
}

export default withStyles(styles)(inject('store')(CreateDiscussionForm));
