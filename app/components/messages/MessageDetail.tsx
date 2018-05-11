import React from 'react';
import Button from 'material-ui/Button';

import { getStore, Message } from '../../lib/store';
import confirm from '../../lib/confirm';
import MessageForm from './MessageForm';

const store = getStore();

class MessageDetail extends React.Component<{ message: Message }> {
  state = {
    isEditing: false,
  };

  edit = () => {
    this.setState({ isEditing: true });
  };

  delete = () => {
    confirm({
      message: 'Are you sure?',
      onAnswer: answer => {
        if (answer) {
          const { message } = this.props;
          message.discussion.deleteMessage(message);
        }
      },
    });
  };

  renderButtons() {
    const { message } = this.props;
    const { currentUser } = store;

    if (!message.user || !currentUser || currentUser._id !== message.user._id) {
      return null;
    }

    return (
      <div>
        <Button onClick={this.edit}>Edit</Button> <Button onClick={this.delete}>Delete</Button>
      </div>
    );
  }

  render() {
    const { message } = this.props;
    const { isEditing } = this.state;

    if (isEditing) {
      return (
        <MessageForm
          message={message}
          onFinished={() => {
            this.setState({ isEditing: false });
          }}
        />
      );
    }

    return (
      <div>
        {this.renderButtons()}
        <p>
          {(message.user && message.user.displayName) || 'User'}: {message.content}{' '}
          {message.isEdited ? '(edited)' : ''}
        </p>
      </div>
    );
  }
}

export default MessageDetail;
