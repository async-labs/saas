import React from 'react';
import { observer, inject } from 'mobx-react';
import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import confirm from '../../lib/confirm';
import { Discussion, Store } from '../../lib/store';

import MenuWithMenuItems from '../common/MenuWithMenuItems';
import DiscussionForm from './DiscussionForm';

const getMenuOptions = discussion => ({
  dataId: discussion._id,
  id: `discussion-menu-${discussion._id}`,
  tooltipTitle: 'Settings for Discussion',
});

const getMenuItemOptions = (discussion, component) => [
  {
    text: 'Copy URL',
    dataId: discussion._id,
    onClick: component.handleDiscussionMenuClose,
  },
  {
    text: 'Edit',
    dataId: discussion._id,
    onClick: component.editDiscussion,
  },
  {
    text: 'Delete',
    dataId: discussion._id,
    onClick: component.deleteDiscussion,
  },
];

@inject('store')
@observer
class DiscussionActionMenu extends React.Component<{ discussion: Discussion; store?: Store }> {
  state = {
    discussionFormOpen: false,
  };

  handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false, selectedDiscussion: null });
  };

  editDiscussion = event => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('You have not selected Team');
      return;
    }

    const { currentTopic } = currentTeam;
    if (!currentTopic) {
      notify('You have not selected Topic');
      return;
    }

    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }

    const selectedDiscussion = currentTopic.discussions.find(d => d._id === id);

    this.setState({ discussionFormOpen: true, selectedDiscussion });
  };

  deleteDiscussion = async event => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    const { currentTopic } = currentTeam;
    if (!currentTopic) {
      notify('Topic have not selected');
      return;
    }

    const id = event.currentTarget.dataset.id;

    confirm({
      title: 'Are you sure?',
      message: '',
      onAnswer: async answer => {
        if (!answer) {
          return;
        }

        NProgress.start();

        try {
          await currentTopic.deleteDiscussion(id);

          notify('You successfully deleted Discussion');
          NProgress.done();
        } catch (error) {
          console.error(error);
          notify(error);
          NProgress.done();
        }
      },
    });
  };

  render() {
    const { discussion } = this.props;

    return (
      <span>
        <MenuWithMenuItems
          menuOptions={getMenuOptions(discussion)}
          itemOptions={getMenuItemOptions(discussion, this)}
        />

        <DiscussionForm
          open={this.state.discussionFormOpen}
          onClose={this.handleDiscussionFormClose}
          discussion={discussion}
        />
      </span>
    );
  }
}

export default DiscussionActionMenu;
