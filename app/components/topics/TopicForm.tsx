import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import NProgress from 'nprogress';
import { inject } from 'mobx-react';

import notify from '../../lib/notifier';
import { Topic, Store } from '../../lib/store';

interface Props {
  onClose: Function;
  open: boolean;
  topic?: Topic;
  fullScreen: boolean;
  store: Store;
}

interface State {
  name: string;
  disabled: boolean;
}

@inject('store')
class TopicForm extends React.Component<Props, State> {
  state = {
    name: '',
    disabled: false,
  };

  static getDerivedStateFromProps(nextProps) {
    const { topic } = nextProps;

    return {
      name: (topic && topic.name) || '',
    };
  }

  handleClose = () => {
    this.setState({ name: '', disabled: false });
    this.props.onClose();
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { store } = this.props;

    if (!store.currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { topic } = this.props;
    const { name } = this.state;

    if (!name) {
      notify('Name is required');
      return;
    }

    NProgress.start();
    try {
      this.setState({ disabled: true });
      if (topic) {
        await topic.edit({ name });
      } else {
        await store.currentTeam.addTopic({ name });
      }

      notify(topic ? 'You successfully edited Topic' : 'You successfully created Topic');
      this.setState({ name: '' });
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
      this.props.onClose();
      NProgress.done();
    }
  };

  render() {
    const { open, topic, fullScreen } = this.props;

    return (
      <Dialog
        maxWidth="xs"
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
            <TextField
              helperText="Give an informative name to the topic"
              value={this.state.name}
              placeholder="Name of topic"
              onChange={event => {
                this.setState({ name: event.target.value });
              }}
            />
            <p style={{ fontSize: '13px' }}>
              All Topics are public. Everyone on the team will see this Topic. Dicussions within a
              Topic can be private.
            </p>
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
                {topic ? 'Update Topic' : 'Add Topic'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withMobileDialog()(TopicForm);
