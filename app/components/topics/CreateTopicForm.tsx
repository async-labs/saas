import React from 'react';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { inject } from 'mobx-react';
// import Router from 'next/router';

import NProgress from 'nprogress';

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
  disabled: boolean;
}

@inject('store')
class CreateTopicForm extends React.Component<Props, State> {
  state = {
    name: '',
    content: '',
    disabled: false,
  };

  handleClose = () => {
    this.setState({ name: '', disabled: false });
    this.props.onClose();
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { store } = this.props;
    const { currentTeam } = store;

    if (!currentTeam) {
      notify('You have not selected Team.');
      return;
    }

    const { name } = this.state;
    if (!name) {
      notify('Please give name to new Topic.');
      return;
    }

    NProgress.start();
    try {
      this.setState({ disabled: true });
      await currentTeam.addTopic({ name });

      notify('You successfully added new Topic.');
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
          <h3>Create new Topic</h3>
          <div style={{ float: 'right' }} />
          <form style={{ width: '100%', height: '60%' }} onSubmit={this.onSubmit}>
            <div>
              <TextField
                autoFocus
                label='Type name of Topic'
                helperText="Give a short and informative name to new Topic"
                value={this.state.name}
                onChange={event => {
                  this.setState({ name: event.target.value });
                }}
              />
              <p />
            </div>
            <p />
            <br />
            <div style={{ float: 'left' }}>
              <Button variant="outlined" onClick={this.handleClose} disabled={this.state.disabled}>
                Cancel
              </Button>{' '}
              <Button type="submit" variant="raised" color="primary" disabled={this.state.disabled}>
                Create Topic
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

export default withStyles(styles)(CreateTopicForm);
