import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import React from 'react';

import notify from '../../lib/notify';
import { Store } from '../../lib/store';
import MemberChooser from '../common/MemberChooser';
import PostEditor from '../posts/PostEditor';

type Props = {
  isMobile: boolean;
  store: Store;
  open: boolean;
  onClose: () => void;
};

type State = {
  name: string;
  memberIds: string[];
  disabled: boolean;
  content: string;
  notificationType: string;
};

class CreateDiscussionForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      memberIds: [],
      disabled: false,
      content: '',
      notificationType: 'default',
    };
  }
  public render() {
    const { open, isMobile, store } = this.props;
    const { currentTeam, currentUser } = store;

    const membersMinusCreator = Array.from(currentTeam.members.values()).filter(
      (user) => user._id !== currentUser._id,
    );

    return (
      <React.Fragment>
        {open ? (
          <Head>
            <title>New Discussion</title>
            <meta name="description" content="Create new discussion" />
          </Head>
        ) : null}
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="simple-dialog-title"
          open={open}
          fullScreen={true}
        >
          <DialogTitle id="simple-dialog-title">Create new Discussion</DialogTitle>
          <DialogContent>
            <br />
            <form style={{ width: '100%', height: '60%' }} onSubmit={this.onSubmit}>
              <p />
              <br />
              <TextField
                autoFocus
                label="Type name of Discussion"
                helperText="Give a short and informative name to new Discussion"
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
                  <MenuItem value="default">Default: without email notification.</MenuItem>
                  <MenuItem value="email">Email: with email notification.</MenuItem>
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
                onChanged={this.onContentChanged}
                members={Array.from(store.currentTeam.members.values())}
                store={store}
                parentComponent="CDF"
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
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }

  public handleMembersChange = (memberIds) => {
    this.setState({ memberIds });
  };

  public handleClose = () => {
    this.setState({
      name: '',
      memberIds: [],
      disabled: false,
      content: '',
      notificationType: 'default',
    });
    this.props.onClose();
  };

  private onContentChanged = (content: string) => {
    console.log('onContentChanged', content);
    this.setState({ content });
  };

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

    // if (!memberIds || memberIds.length < 1) {
    //   notify('Please assign at least one person to this Discussion.');
    //   return;
    // }

    if (!notificationType) {
      notify('Please select notification type.');
      return;
    }

    this.setState({ disabled: true });
    NProgress.start();

    try {
      const discussion = await currentTeam.addDiscussion({
        name,
        memberIds,
        notificationType,
      });

      const post = await discussion.addPost(content);

      const dev = process.env.NODE_ENV !== 'production';

      if (discussion.notificationType === 'email') {
        const userIdsForLambda = discussion.memberIds.filter((m) => m !== discussion.createdUserId);

        await discussion.sendDataToLambda({
          discussionName: discussion.name,
          discussionLink: `${
            dev ? process.env.NEXT_PUBLIC_URL_APP : process.env.NEXT_PUBLIC_PRODUCTION_URL_APP
          }/teams/${discussion.team.slug}/discussions/${discussion.slug}`,
          postContent: post.content,
          authorName: post.user.displayName,
          userIds: userIdsForLambda,
        });
      }

      this.setState({ name: '', memberIds: [], content: '', notificationType: 'default' });

      notify('You successfully added new Discussion.');

      Router.push(
        `/discussion?teamSlug=${currentTeam.slug}&discussionSlug=${discussion.slug}`,
        `/teams/${currentTeam.slug}/discussions/${discussion.slug}`,
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
}

export default observer(CreateDiscussionForm);
