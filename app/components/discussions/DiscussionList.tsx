import React from 'react';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Link from 'next/link';
import { observer, inject } from 'mobx-react';

import { Store, Topic } from '../../lib/store';

import DiscussionActionMenu from '../discussions/DiscussionActionMenu';
import DiscussionForm from './DiscussionForm';

const stylePaper = {
  margin: '10px 5px',
  padding: '10px 5px',
};

@inject('store')
@observer
class DiscussionList extends React.Component<{ store?: Store; topic: Topic }> {
  state = {
    discussionFormOpen: false,
    selectedDiscussion: null,
  };

  handleDiscussionEvent = data => {
    console.log('discussion realtime event', data);
    const { topic } = this.props;
    topic.handleDiscussionRealtimeEvent(data);
  };

  addDiscussion = event => {
    event.preventDefault();
    this.setState({ discussionFormOpen: true });
  };

  handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false, selectedDiscussion: null });
  };

  render() {
    const { store, topic } = this.props;
    const { selectedDiscussion } = this.state;

    return (
      <div>
        <h3>{topic.name}</h3>

        <p style={{ display: 'inline' }}>All Discussions:</p>

        <Tooltip title="Add Discussion" placement="right" disableFocusListener disableTouchListener>
          <a onClick={this.addDiscussion} style={{ float: 'right', padding: '0px 10px' }}>
            <i className="material-icons" color="action" style={{ fontSize: 14, opacity: 0.7 }}>
              add_circle_outline
            </i>{' '}
          </a>
        </Tooltip>

        <br />

        <ul>
          {topic &&
            topic.orderedDiscussions.map(d => {
              return (
                <Paper
                  key={d._id}
                  style={stylePaper}
                  elevation={topic.currentDiscussionSlug === d.slug ? 8 : 2}
                >
                  <li key={d._id}>
                    <Link
                      href={`/discussions/detail?teamSlug=${topic.team.slug}&topicSlug=${
                        topic.slug
                      }&discussionSlug=${d.slug}`}
                      as={`/team/${topic.team.slug}/t/${topic.slug}/${d.slug}`}
                    >
                      <a
                        style={{
                          fontSize: '14px',
                          fontWeight: topic.currentDiscussionSlug === d.slug ? 600 : 300,
                        }}
                      >
                        {d.name}
                      </a>
                    </Link>

                    <DiscussionActionMenu discussion={d} />
                  </li>
                </Paper>
              );
            })}
        </ul>

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
