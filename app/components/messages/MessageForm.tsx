import React from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import { getStore, Message } from '../../lib/store';

const store = getStore();

class MessageForm extends React.Component<
  { message?: Message; onFinished?: Function },
  { content: string }
> {
  constructor(props) {
    super(props);

    const { message } = props;
    this.state = {
      content: (message && message.content) || '',
    };
  }

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { content } = this.state;
    const { message, onFinished } = this.props;

    if (!content) {
      notify('Content is required');
      return;
    }

    if (message) {
      NProgress.start();
      try {
        await message.edit({ content });

        NProgress.done();
      } catch (error) {
        console.log(error);
        notify(error);
        NProgress.done();
      }

      if (onFinished) {
        onFinished();
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

    const { currentDiscussion } = currentTopic;
    if (!currentDiscussion) {
      notify('Discussion have not selected');
      return;
    }

    NProgress.start();
    try {
      await currentDiscussion.addMessage({ content });

      this.setState({ content: '' });
      NProgress.done();
    } catch (error) {
      console.log(error);
      notify(error);
      NProgress.done();
    }
  };

  cancel = () => {
    const { onFinished } = this.props;
    if (onFinished) {
      onFinished();
    }
  };

  render() {
    const { message } = this.props;

    return (
      <form onSubmit={this.onSubmit}>
        <TextField
          multiline
          value={this.state.content}
          placeholder="Type message"
          onChange={event => {
            this.setState({ content: event.target.value });
          }}
        />
        <p />
        <div>
          <Button type="submit" variant="raised" color="primary">
            {message ? 'Save' : 'Send'}
          </Button>{' '}
          {message ? (
            <Button variant="raised" onClick={this.cancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    );
  }
}

export default MessageForm;
