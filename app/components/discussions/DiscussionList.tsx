import React from 'react';
import Icon from 'material-ui/Icon';
import Button from 'material-ui/Button';
import Menu, { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Tooltip from 'material-ui/Tooltip';
import Link from 'next/link';
import { observer } from 'mobx-react';
import NProgress from 'nprogress';

import notify from '../../lib/notifier';
import confirm from '../../lib/confirm';
import { getStore } from '../../lib/store';

import TopicActionMenu from '../topics/TopicActionMenu';
import DiscussionForm from './DiscussionForm';

const store = getStore();

@observer
class DiscussionList extends React.Component {
  state = {
    discussionFormOpen: false,
    discussionMenuElm: null,
    selectedDiscussion: null,
    searchQuery: '',
  };

  handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false, selectedDiscussion: null });
  };

  addDiscussion = event => {
    event.preventDefault();
    this.setState({ discussionFormOpen: true });
  };

  search = event => {
    event.preventDefault();
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

    currentTopic.searchDiscussion(this.state.searchQuery);
  };

  editDiscussion = event => {
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

    const id = event.currentTarget.dataset.id;
    if (!id) {
      return;
    }

    const selectedDiscussion = currentTopic.discussions.find(d => d._id === id);

    this.setState({ discussionMenuElm: null, discussionFormOpen: true, selectedDiscussion });
  };

  deleteDiscussion = async event => {
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

    const id = event.currentTarget.dataset.id;
    this.setState({ discussionMenuElm: null });

    confirm({
      message: 'Are you sure?',
      onAnswer: async answer => {
        if (!answer) {
          return;
        }

        NProgress.start();

        try {
          await currentTopic.deleteDiscussion(id);

          notify('Deleted');
          NProgress.done();
        } catch (error) {
          console.error(error);
          notify(error);
          NProgress.done();
        }
      },
    });
  };

  togglePin = async event => {
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

    const id = event.currentTarget.dataset.id;
    const isPinned = event.currentTarget.dataset.ispinned === '1';
    this.setState({ discussionMenuElm: null });

    NProgress.start();

    try {
      await currentTopic.toggleDiscussionPin({ id: id, isPinned: !isPinned });
      NProgress.done();
    } catch (error) {
      console.error(error);
      notify(error);
      NProgress.done();
    }
  };

  showDiscussionMenu = event => {
    this.setState({ discussionMenuElm: event.currentTarget });
  };

  handleDiscussionMenuClose = () => {
    this.setState({ discussionMenuElm: null });
  };

  render() {
    const { currentTeam } = store;

    if (!currentTeam) {
      return <div>Team not selected</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div>loading...</div>;
    }

    const { currentTopic } = store.currentTeam;

    const { discussionMenuElm, selectedDiscussion } = this.state;

    return (
      <div>
        <h3>
          {currentTopic.name}
          <TopicActionMenu topic={currentTopic} />
        </h3>

        <p style={{ display: 'inline' }}>All Discussions:</p>

        <Tooltip title="Add Discussion" placement="right">
          <a onClick={this.addDiscussion} style={{ float: 'right', padding: '0px 10px' }}>
            <Icon color="action" style={{ fontSize: 14, opacity: 0.7 }}>
              add_circle
            </Icon>{' '}
          </a>
        </Tooltip>

        <div>
          <form onSubmit={this.search}>
            <TextField
              fullWidth
              label="Search by name"
              helperText="Search for discussion"
              onChange={e => this.setState({ searchQuery: e.target.value })}
            />
          </form>
        </div>

        <br />

        <ul>
          {currentTopic &&
            currentTopic.discussions.map(d => (
              <li key={d._id}>
                <Link
                  href={`/discussions/detail?teamSlug=${currentTeam.slug}&topicSlug=${
                    currentTopic.slug
                  }&discussionSlug=${d.slug}`}
                  as={`/team/${currentTeam.slug}/t/${currentTopic.slug}/${d.slug}`}
                >
                  <a>
                    {store.hasNotification({ discussionId: d._id }) ? (
                      <Icon color="action" style={{ fontSize: 14, opacity: 0.7 }}>
                        lens
                      </Icon>
                    ) : null}
                    {d.name}
                  </a>
                </Link>

                {d.isPinned ? ' Pinned' : null}

                <Tooltip title="Settings" placement="right">
                  <a href="#" style={{ float: 'right', padding: '0px 10px' }}>
                    <Icon
                      aria-owns={discussionMenuElm ? `discussion-menu-${d._id}` : null}
                      aria-haspopup="true"
                      data-id={d._id}
                      onClick={this.showDiscussionMenu}
                      color="action"
                      style={{ fontSize: 14, opacity: 0.7 }}
                    >
                      more_vert
                    </Icon>
                  </a>
                </Tooltip>

                <Menu
                  id={`discussion-menu-${d._id}`}
                  anchorEl={discussionMenuElm}
                  open={!!discussionMenuElm && discussionMenuElm.dataset.id === d._id}
                  onClose={this.handleDiscussionMenuClose}
                >
                  <MenuItem data-id={d._id} onClick={this.editDiscussion}>
                    Edit
                  </MenuItem>
                  <MenuItem
                    data-ispinned={d.isPinned ? '1' : '0'}
                    data-id={d._id}
                    onClick={this.togglePin}
                  >
                    {d.isPinned ? 'Unpin' : 'Pin'}
                  </MenuItem>
                  <MenuItem data-id={d._id} onClick={this.deleteDiscussion}>
                    Delete
                  </MenuItem>
                  <MenuItem onClick={this.handleDiscussionMenuClose}>Copy URL</MenuItem>
                </Menu>
                <hr />
              </li>
            ))}
        </ul>

        {currentTopic.hasMoreDiscussion ? (
          <Button onClick={() => currentTopic.loadMoreDiscussions()}>load more...</Button>
        ) : null}

        <DiscussionForm
          open={this.state.discussionFormOpen}
          onClose={this.handleDiscussionFormClose}
          discussion={selectedDiscussion}
        />
      </div>
    );
  }
}

export default DiscussionList;
