import { inject, observer } from 'mobx-react';
import NProgress from 'nprogress';
import React from 'react';

import confirm from '../../lib/confirm';
import notify from '../../lib/notifier';
import { Discussion, Store } from '../../lib/store';

import env from '../../lib/env';
import MenuWithMenuItems from '../common/MenuWithMenuItems';
import EditDiscussionForm from './EditDiscussionForm';

const { PRODUCTION_URL_APP, DEVELOPMENT_URL_APP, NODE_ENV } = env;
const dev = NODE_ENV !== 'production';
const ROOT_URL = dev ? DEVELOPMENT_URL_APP : PRODUCTION_URL_APP;

const getMenuOptions = discussion => ({
  dataId: discussion._id,
  id: `discussion-menu-${discussion._id}`,
});

const getMenuItemOptionsForCreator = (discussion, component) => [
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

const getMenuItemOptions = (discussion, component) => [
  {
    text: 'Copy URL',
    dataId: discussion._id,
    onClick: component.handleCopyUrl,
  },
];

class DiscussionActionMenu extends React.Component<{
  discussion: Discussion;
  store?: Store;
  isMobile: boolean;
}> {
  public state = {
    discussionFormOpen: false,
  };

  public handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false, selectedDiscussion: null });
  };

  public render() {
    const { discussion, store } = this.props;
    const { currentUser } = store;

    const isCreator = currentUser._id === discussion.createdUserId ? true : false;

    return (
      <React.Fragment>
        <MenuWithMenuItems
          menuOptions={getMenuOptions(discussion)}
          itemOptions={
            isCreator
              ? getMenuItemOptionsForCreator(discussion, this)
              : getMenuItemOptions(discussion, this)
          }
        />

        {this.state.discussionFormOpen ? (
          <EditDiscussionForm
            open={true}
            onClose={this.handleDiscussionFormClose}
            discussion={discussion}
            isMobile={this.props.isMobile}
          />
        ) : null}
      </React.Fragment>
    );
  }
  public handleCopyUrl = async event => {
    const { store } = this.props;
    const { currentTeam } = store;

    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }

    const selectedDiscussion = currentTeam.discussions.find(d => d._id === id);
    const discussionUrl = `${ROOT_URL}/team/${currentTeam.slug}/discussions/${
      selectedDiscussion.slug
    }`;

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

  public editDiscussion = event => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('You have not selected Team.');
      return;
    }

    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }

    const selectedDiscussion = currentTeam.discussions.find(d => d._id === id);

    this.setState({ discussionFormOpen: true, selectedDiscussion });
  };

  public deleteDiscussion = async event => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('You have not selected Team.');
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
          await currentTeam.deleteDiscussion(id);

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
}

export default inject('store')(observer(DiscussionActionMenu));
