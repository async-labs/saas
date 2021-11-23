import Tooltip from '@material-ui/core/Tooltip';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { observer } from 'mobx-react';
import React from 'react';

import { Store } from '../../lib/store';
import { Team } from '../../lib/store/team';

import CreateDiscussionForm from './CreateDiscussionForm';
import DiscussionListItem from './DiscussionListItem';

import notify from '../../lib/notify';

type Props = { store: Store; team: Team; isMobile: boolean };

type State = { discussionFormOpen: boolean };

class DiscussionList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      discussionFormOpen: false,
    };
  }

  public componentDidMount() {
    this.props.team.loadDiscussions().catch((err) => notify(err));
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.team._id !== prevProps.team._id) {
      this.props.team.loadDiscussions().catch((err) => notify(err));
    }
  }

  public render() {
    const { store, team } = this.props;

    const isThemeDark = store && store.currentUser && store.currentUser.darkTheme === true;

    return (
      <div>
        Discussions
        <Tooltip title="Add Discussion" placement="right" disableFocusListener disableTouchListener>
          <a onClick={this.addDiscussion} style={{ float: 'right', padding: '0px 10px' }}>
            <AddCircleOutlineIcon
              color="action"
              style={{ fontSize: 14, opacity: 0.7, color: isThemeDark ? '#fff' : '#000' }}
            />{' '}
          </a>
        </Tooltip>
        <p />
        <ul style={{ listStyle: 'none', padding: '0px' }}>
          {team &&
            team.orderedDiscussions.map((d) => {
              return (
                <DiscussionListItem
                  key={d._id}
                  discussion={d}
                  team={team}
                  isMobile={this.props.isMobile}
                  store={this.props.store}
                />
              );
            })}
        </ul>
        <CreateDiscussionForm
          isMobile={this.props.isMobile}
          store={this.props.store}
          open={this.state.discussionFormOpen}
          onClose={this.handleDiscussionFormClose}
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

export default observer(DiscussionList);
