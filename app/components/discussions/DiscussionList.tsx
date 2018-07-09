import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { observer, inject } from 'mobx-react';

import { Store, Team } from '../../lib/store';

import ActiveLink from '../common/ActiveLink';
import DiscussionListItem from './DiscussionListItem';
import CreateDiscussionForm from './CreateDiscussionForm';

type Props = { store?: Store; team: Team };

class DiscussionList extends React.Component<Props> {
  state = {
    discussionFormOpen: false,
  };

  // componentDidMount() {
  //   this.props.team.loadDiscussions();
  // }

  componentDidUpdate(prevProps: Props) {
    if (this.props.team._id !== prevProps.team._id) {
      this.props.team.loadDiscussions();
    }
  }

  addDiscussion = event => {
    event.preventDefault();
    this.setState({ discussionFormOpen: true });
  };

  handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false });
  };

  render() {
    const { store, team } = this.props;

    console.log(team.orderedDiscussions.length);

    return (
      <div>
        <ActiveLink
          hasIcon
          linkText="Discussions"
          href={`/discussion?teamSlug=${team.slug}`}
          as={`/team/${team.slug}/d`}
          highlighterSlug={`/${team.slug}/d`}
        />

        <Tooltip title="Add Discussion" placement="right" disableFocusListener disableTouchListener>
          <a onClick={this.addDiscussion} style={{ float: 'right', padding: '0px 10px' }}>
            <i className="material-icons" color="action" style={{ fontSize: 14, opacity: 0.7 }}>
              add_circle_outline
            </i>{' '}
          </a>
        </Tooltip>
        <p />
        <ul style={{ listStyle: 'none', padding: '0px' }}>
          {team &&
            team.orderedDiscussions.map(d => {
              return (
                <DiscussionListItem
                  key={d._id}
                  discussion={d}
                  team={team}
                />
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
