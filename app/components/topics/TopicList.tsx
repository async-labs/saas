import React from 'react';
import Icon from 'material-ui/Icon';
import Link from 'next/link';
import Tooltip from 'material-ui/Tooltip';
import { observer } from 'mobx-react';

import { getStore } from '../../lib/store';

import TopicForm from './TopicForm';

const store = getStore();

@observer
class TopicList extends React.Component {
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
    return (
      <div>
        <p style={{ display: 'inline' }}>Public</p>
        <Tooltip title="Add new Topic" placement="right">
          <a onClick={this.addPublicTopic} style={{ float: 'right', padding: '0px 10px' }}>
            <Icon color="action" style={{ fontSize: 14, opacity: 0.7 }}>
              add_circle
            </Icon>{' '}
          </a>
        </Tooltip>
        <ul>
          {store.currentTeam.topics.map(t => (
            <li key={t._id}>
              <Link
                href={`/topics/detail?teamSlug=${t.team.slug}&topicSlug=${t.slug}`}
                as={`/team/${t.team.slug}/t/${t.slug}`}
              >
                <a>
                  {store.hasNotification({ topicId: t._id }) ? (
                    <Icon color="action" style={{ fontSize: 10, opacity: 1 }}>
                      lens
                    </Icon>
                  ) : null}
                  {t.name}
                </a>
              </Link>
              <p />
            </li>
          ))}
        </ul>
        <TopicForm open={this.state.addPublicTopicOpen} onClose={this.handleAddPublicTopicClose} />
      </div>
    );
  }
}

export default TopicList;
