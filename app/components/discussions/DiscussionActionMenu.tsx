import React from 'react';
import { observer, inject } from 'mobx-react';
import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import confirm from '../../lib/confirm';
import { Discussion, Store } from '../../lib/store';

import MenuWithMenuItems from '../common/MenuWithMenuItems';
import EditDiscussionForm from './EditDiscussionForm';
import env from '../../lib/env';

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_APP } = env;
const ROOT_URL = dev ? `http://localhost:3000` : PRODUCTION_URL_APP;

const getMenuOptions = discussion => ({
  dataId: discussion._id,
  id: `discussion-menu-${discussion._id}`,
  tooltipTitle: 'Settings for Discussion',
});

const getMenuItemOptions = (discussion, component) => [
  {
    text: 'Copy URL',
    dataId: discussion._id,
    onClick: component.handleCopyUrl,
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

class DiscussionActionMenu extends React.Component<{ discussion: Discussion; store?: Store }> {
  state = {
    discussionFormOpen: false,
  };

  handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false, selectedDiscussion: null });
  };

  handleCopyUrl = async event => {
    const { store } = this.props;
    const { currentTeam } = store;
    const { currentTopic } = currentTeam;

    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }

    const selectedDiscussion = currentTopic.discussions.find(d => d._id === id);
    const discussionUrl = `${ROOT_URL}/team/${currentTeam.slug}/t/${currentTopic.slug}/d/${
      selectedDiscussion.slug
    }`;

    console.log(discussionUrl);

    try {
      if (window.navigator) {
        await window.navigator.clipboard.writeText(discussionUrl);
        notify('You successfully copied URL.');
      }
    } catch (err) {
      notify(err);
    } finally {
      this.setState({ discussionFormOpen: false, selectedDiscussion: null });
    }
  };

  editDiscussion = event => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('You have not selected Team.');
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
      notify('You have not selected Team.');
      return;
    }

    const { currentTopic } = currentTeam;
    if (!currentTopic) {
      notify('You have not selected Topic.');
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

          notify('You successfully deleted Discussion.');
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

        {this.state.discussionFormOpen ? (
          <EditDiscussionForm
            open={true}
            onClose={this.handleDiscussionFormClose}
            discussion={discussion}
          />
        ) : null}
      </span>
    );
  }
}

export default inject('store')(observer(DiscussionActionMenu));
