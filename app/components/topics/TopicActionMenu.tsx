import React from 'react';
import Menu, { MenuItem } from 'material-ui/Menu';
import Icon from 'material-ui/Icon';
import Tooltip from 'material-ui/Tooltip';
import { observer } from 'mobx-react';
import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import confirm from '../../lib/confirm';
import { Topic } from '../../lib/store';

import TopicForm from './TopicForm';

@observer
class TopicActionMenu extends React.Component<{ topic: Topic }> {
  state = {
    topicFormOpen: false,
    topicMenuElm: null,
  };

  handleTopicFormClose = () => {
    this.setState({ topicFormOpen: false });
  };

  editTopic = () => {
    this.setState({ topicMenuElm: null, topicFormOpen: true });
  };

  deleteTopic = async () => {
    const { topic } = this.props;

    this.setState({ topicMenuElm: null });

    confirm({
      message: 'Are you sure?',
      onAnswer: async answer => {
        if (!answer) {
          return;
        }

        NProgress.start();

        try {
          await topic.team.deleteTopic(topic._id);

          notify('Deleted');
          NProgress.done();
        } catch (error) {
          console.log(error);
          notify(error);
          NProgress.done();
        }
      },
    });
  };

  showTopicMenu = event => {
    this.setState({ topicMenuElm: event.currentTarget });
  };

  handleTopicMenuClose = () => {
    this.setState({ topicMenuElm: null });
  };

  render() {
    const { topic } = this.props;
    const { topicMenuElm } = this.state;

    return (
      <span>
        <Tooltip title="Settings" placement="right">
          <a href="#" style={{ float: 'right', padding: '0px 10px' }}>
            <Icon
              aria-owns={topicMenuElm ? 'topic-menu' : null}
              aria-haspopup="true"
              onClick={this.showTopicMenu}
              color="action"
              style={{ fontSize: 14, opacity: 0.7 }}
            >
              more_vert
            </Icon>
          </a>
        </Tooltip>

        <Menu
          id="topic-menu"
          anchorEl={topicMenuElm}
          open={!!topicMenuElm}
          onClose={this.handleTopicMenuClose}
        >
          <MenuItem onClick={this.editTopic}>Edit</MenuItem>
          <MenuItem onClick={this.deleteTopic}>Delete</MenuItem>
        </Menu>

        <TopicForm
          open={this.state.topicFormOpen}
          onClose={this.handleTopicFormClose}
          topic={topic}
        />
      </span>
    );
  }
}

export default TopicActionMenu;
