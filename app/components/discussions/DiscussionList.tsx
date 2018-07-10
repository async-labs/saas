import Tooltip from '@material-ui/core/Tooltip';
import { inject, observer } from 'mobx-react';
import React from 'react';

import { Store, Team } from '../../lib/store';

import ActiveLink from '../common/ActiveLink';
import CreateDiscussionForm from './CreateDiscussionForm';
import DiscussionListItem from './DiscussionListItem';

type Props = { store?: Store; team: Team };

class DiscussionList extends React.Component<Props> {
  public state = {
    discussionFormOpen: false,
  };

  public componentDidUpdate(prevProps: Props) {
    if (this.props.team._id !== prevProps.team._id) {
      this.props.team.loadDiscussions();
    }
  }

  public render() {
    const { team } = this.props;

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
              return <DiscussionListItem key={d._id} discussion={d} team={team} />;
            })}
        </ul>

        <CreateDiscussionForm
          open={this.state.discussionFormOpen}
          onClose={this.handleDiscussionFormClose}
        />
      </div>
    );
  }

  public addDiscussion = event => {
    event.preventDefault();
    this.setState({ discussionFormOpen: true });
  };

  public handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false });
  };
}

export default inject('store')(observer(DiscussionList));
