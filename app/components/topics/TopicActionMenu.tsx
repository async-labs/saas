import React from 'react';
import { observer, inject } from 'mobx-react';
import NProgress from 'nprogress';

import MenuWithMenuItems from '../common/MenuWithMenuItems';

import notify from '../../lib/notifier';
import confirm from '../../lib/confirm';
import { Topic } from '../../lib/store';

import TopicForm from './TopicForm';

const getMenuOptions = topic => ({
  dataId: topic._id,
  id: `topic-menu-${topic._id}`,
  tooltipTitle: 'Settings for Topic',
});

const getMenuItemOptions = (topic, component) => [
  {
    text: 'Edit',
    dataId: topic._id,
    onClick: component.editTopic,
  },
  {
    text: 'Delete',
    dataId: topic._id,
    onClick: component.deleteTopic,
  },
];

@inject('store')
@observer
class TopicActionMenu extends React.Component<{ topic: Topic }> {
  state = {
    topicFormOpen: false,
  };

  handleTopicFormClose = () => {
    this.setState({ topicFormOpen: false });
  };

  editTopic = () => {
    this.setState({ topicFormOpen: true });
  };

  deleteTopic = async () => {
    const { topic } = this.props;

    confirm({
      title: 'Are you sure?',
      message: '',
      onAnswer: async answer => {
        if (!answer) {
          return;
        }

        NProgress.start();

        try {
          await topic.team.deleteTopic(topic._id);

          notify('You successfully deleted Topic');
          NProgress.done();
        } catch (error) {
          console.log(error);
          notify(error);
          NProgress.done();
        }
      },
    });
  };

  render() {
    const { topic } = this.props;

    return (
      <span>
        <MenuWithMenuItems
          menuOptions={getMenuOptions(topic)}
          itemOptions={getMenuItemOptions(topic, this)}
        />

        {this.state.topicFormOpen ? (
          <TopicForm
            open={this.state.topicFormOpen}
            onClose={this.handleTopicFormClose}
            topic={topic}
          />
        ) : null}
      </span>
    );
  }
}

export default TopicActionMenu;
