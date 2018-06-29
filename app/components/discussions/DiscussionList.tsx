import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import { observer, inject } from 'mobx-react';

import { Store, Topic } from '../../lib/store';

import ActiveLink from '../common/ActiveLink';
import DiscussionActionMenu from '../discussions/DiscussionActionMenu';
import CreateDiscussionForm from './CreateDiscussionForm';

const stylePaper = {
  margin: '10px 5px',
  padding: '10px 5px',
};

class DiscussionList extends React.Component<{ store?: Store; topic: Topic }> {
  state = {
    discussionFormOpen: false,
  };

  addDiscussion = event => {
    event.preventDefault();
    this.setState({ discussionFormOpen: true });
  };

  handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false });
  };

  render() {
    const { topic } = this.props;

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
                    <ActiveLink
                      linkText={d.name}
                      href={`/discussions/detail?teamSlug=${topic.team.slug}&topicSlug=${
                        topic.slug
                      }&discussionSlug=${d.slug}`}
                      as={`/team/${topic.team.slug}/t/${topic.slug}/d/${d.slug}`}
                      highlighterSlug={`/team/${topic.team.slug}/t/${topic.slug}/d/${d.slug}`}
                    />

                    <DiscussionActionMenu discussion={d} />
                  </li>
                </Paper>
              );
            })}
        </ul>

        <CreateDiscussionForm
          open={this.state.discussionFormOpen}
          onClose={this.handleDiscussionFormClose}
        />
      </div>
    );
  }
}

export default inject('store')(observer(DiscussionList));
