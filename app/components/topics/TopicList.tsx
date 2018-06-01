import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { observer, inject } from 'mobx-react';
import Paper from '@material-ui/core/Paper';

import TopicActionMenu from '../topics/TopicActionMenu';
import TopicForm from './TopicForm';
import ActiveLink from '../common/ActiveLink';
import { Store } from '../../lib/store';

const stylePaper = {
  margin: '10px 5px',
  padding: '10px 5px',
};

@inject('store')
@observer
class TopicList extends React.Component<{ store: Store }> {
  state = {
    addPublicTopicOpen: false,
  };

  handleAddPublicTopicClose = () => {
    this.setState({ addPublicTopicOpen: false });
  };

  addPublicTopic = event => {
    event.preventDefault();
    this.setState({ addPublicTopicOpen: true });
  };

  render() {
    const { store } = this.props;

    const { currentTeam } = store;

    if (!currentTeam) {
      return <div>Team not selected</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div>loading...</div>;
    }

    return (
      <div style={{ padding: '0px 5px 0px 0px' }}>
        <p style={{ display: 'inline', fontSize: '14px' }}>Public</p>
        <Tooltip title="Add new Topic" placement="right" disableFocusListener disableTouchListener>
          <a onClick={this.addPublicTopic} style={{ float: 'right', padding: '0px 10px' }}>
            <i className="material-icons" color="action" style={{ fontSize: 14, opacity: 0.7 }}>
              add_circle_outline
            </i>{' '}
          </a>
        </Tooltip>
        <ul>
          {currentTeam.topics.map(t => (
            <Paper
              key={t._id}
              style={stylePaper}
              elevation={currentTeam.currentTopicSlug === t.slug ? 8 : 2}
            >
              <li key={t._id}>
                <div style={{ display: 'inline' }}>
                  <ActiveLink
                    linkText={t.name}
                    href={`/topics/detail?teamSlug=${t.team.slug}&topicSlug=${t.slug}`}
                    as={`/team/${t.team.slug}/t/${t.slug}`}
                  />
                </div>
                <TopicActionMenu topic={t} />
              </li>
            </Paper>
          ))}
        </ul>
        <TopicForm open={this.state.addPublicTopicOpen} onClose={this.handleAddPublicTopicClose} />
      </div>
    );
  }
}

export default TopicList;
