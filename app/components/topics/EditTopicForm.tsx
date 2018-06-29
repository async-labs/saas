import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import { inject } from 'mobx-react';

import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import { Store, Topic } from '../../lib/store';

interface Props {
  store?: Store;
  onClose: Function;
  open: boolean;
  topic: Topic;
}

interface State {
  name: string;
  disabled: boolean;
  topicId: string;
}

class EditTopicForm extends React.Component<Props, State> {
  state = {
    name: '',
    disabled: false,
    topicId: '',
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    const { topic } = props;

    if (state.topicId === topic._id) {
      return;
    }

    return {
      name: (topic && topic.name) || '',
      topicId: topic._id,
    };
  }

  handleClose = () => {
    this.setState({ name: '', disabled: false });
    this.props.onClose();
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { topic, store } = this.props;
    const { currentTeam } = store;
    const { name } = this.state;

    if (!currentTeam) {
      notify('You have not selected Team.');
      return;
    }

    const { currentTopic } = currentTeam;
    if (!currentTopic) {
      notify('You have not selected Topic.');
      return;
    }

    if (!name) {
      notify('Please give name to new Topic.');
      return;
    }

    NProgress.start();
    try {
      this.setState({ disabled: true });

      await topic.edit({ name });

      this.setState({ name: '' });
      notify('You successfully edited Topic');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.props.onClose();
      NProgress.done();
      this.setState({ disabled: false });
    }
  };

  render() {
    const { open, topic } = this.props;

    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Edit Topic</DialogTitle>
        <DialogContent>
          <DialogContentText>Add explanation</DialogContentText>
          <hr />
          <TextField
            value={this.state.name}
            onChange={event => {
              this.setState({ name: event.target.value });
            }}
          />
          <br />
          <form onSubmit={this.onSubmit}>
            <br />
            <DialogActions>
              <Button
                color="primary"
                variant="outlined"
                onClick={this.handleClose}
                disabled={this.state.disabled}
              >
                Cancel
              </Button>{' '}
              <Button type="submit" variant="raised" color="primary" disabled={this.state.disabled}>
                Update Topic
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

export default inject('store')(EditTopicForm);
