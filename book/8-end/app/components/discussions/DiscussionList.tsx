import Tooltip from '@material-ui/core/Tooltip';
import { inject, observer } from 'mobx-react';
import React from 'react';

import { Store } from '../../lib/store';
import { Team } from '../../lib/store/team';

import ActiveLink from '../common/ActiveLink';
import CreateDiscussionForm from './CreateDiscussionForm';
import DiscussionListItem from './DiscussionListItem';

import notify from '../../lib/notify';

type Props = { store?: Store; team: Team; isMobile: boolean };

class DiscussionList extends React.Component<Props> {
  public state = {
    discussionFormOpen: false,
  };

  public componentDidMount() {
    this.props.team.loadDiscussions().catch((err) => notify(err));
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.team._id !== prevProps.team._id) {
      this.props.team.loadDiscussions().catch((err) => notify(err));
    }
  }

  public render() {
    const { team } = this.props;

    return (
      <div>
        <ActiveLink
          hasIcon
          linkText="Discussions"
          href={`/discussion?teamSlug=${team.slug}`}
          as={`/team/${team.slug}/discussions`}
          highlighterSlug={`/team/${team.slug}/discussions`}
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
            team.orderedDiscussions().map((d) => {
              return (
                <DiscussionListItem
                  key={d._id}
                  discussion={d}
                  team={team}
                  isMobile={this.props.isMobile}
                />
              );
            })}
        </ul>

        <CreateDiscussionForm
          open={this.state.discussionFormOpen}
          onClose={this.handleDiscussionFormClose}
          isMobile={this.props.isMobile}
        />
      </div>
    );
  }

  public addDiscussion = (event) => {
    event.preventDefault();
    this.setState({ discussionFormOpen: true });
  };

  public handleDiscussionFormClose = () => {
    this.setState({ discussionFormOpen: false });
  };
}

export default inject('store')(observer(DiscussionList));
