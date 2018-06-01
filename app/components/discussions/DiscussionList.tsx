import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Link from 'next/link';
import { observer, inject } from 'mobx-react';

import notify from '../../lib/notifier';
import { Store } from '../../lib/store';

import DiscussionActionMenu from '../discussions/DiscussionActionMenu';
import DiscussionForm from './DiscussionForm';

const stylePaper = {
  margin: '10px 5px',
  padding: '10px 5px',
};

@inject('store')
@observer
class DiscussionList extends React.Component<{ store?: Store }> {
  state = {
    discussionFormOpen: false,
    selectedDiscussion: null,
    searchQuery: '',
  };

  addDiscussion = event => {
    event.preventDefault();
    this.setState({ discussionFormOpen: true });
  };

  handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false, selectedDiscussion: null });
  };

  search = event => {
    event.preventDefault();
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

    currentTopic.searchDiscussion(this.state.searchQuery);
  };

  render() {
    const { store } = this.props;
    const { currentTeam } = store;

    if (!currentTeam) {
      return <div>Team not selected</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div style={{ padding: '0px 0px 0px 20px' }}>loading...</div>;
    }

    const { currentTopic, currentTopicSlug } = store.currentTeam;
    const { currentDiscussionSlug } = currentTopic;

    const { selectedDiscussion } = this.state;

    return (
      <div>
        <h3>{currentTopic.name}</h3>

        <p style={{ display: 'inline' }}>All Discussions:</p>

        <Tooltip title="Add Discussion" placement="right" disableFocusListener disableTouchListener>
          <a onClick={this.addDiscussion} style={{ float: 'right', padding: '0px 10px' }}>
            <i className="material-icons" color="action" style={{ fontSize: 14, opacity: 0.7 }}>
              add_circle_outline
            </i>{' '}
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
            currentTopic.discussions.map(d => {

              return (
                <Paper
                  key={d._id}
                  style={stylePaper}
                  elevation={currentDiscussionSlug === d.slug ? 8 : 2}
                >
                  <li key={d._id}>
                    <Link
                      href={`/discussions/detail?teamSlug=${currentTeam.slug}&topicSlug=${
                        currentTopic.slug
                      }&discussionSlug=${d.slug}`}
                      as={`/team/${currentTeam.slug}/t/${currentTopicSlug}/${d.slug}`}
                    >
                      <a
                        style={{
                          fontSize: '14px',
                          fontWeight: currentDiscussionSlug === d.slug ? 600 : 300,
                        }}
                      >
                        {d.name}
                      </a>
                    </Link>

                    {d.isPinned ? ' Pinned' : null}

                    <DiscussionActionMenu discussion={d} />
                  </li>
                </Paper>
              );
            })}
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
