import React from 'react';
import { observer } from 'mobx-react';
import Button from 'material-ui/Button';

import withLayout from '../../lib/withLayout';
import withAuth from '../../lib/withAuth';
import { getStore } from '../../lib/store';
import notify from '../../lib/notifier';
import confirm from '../../lib/confirm';
import InviteMember from '../../components/teams/InviteMember';

const store = getStore();

class Settings extends React.Component<{ teamSlug: string }> {
  state = {
    inviteMemberOpen: false,
  };

  static async getInitialProps({ query }) {
    const { teamSlug } = query;

    return { teamSlug };
  }

  componentDidMount() {
    this.checkTeam();
  }

  componentDidUpdate() {
    this.checkTeam();
  }

  checkTeam() {
    const { teamSlug } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== teamSlug) {
      store.setCurrentTeam(teamSlug);
    }
  }

  handleInviteMemberClose = () => {
    this.setState({ inviteMemberOpen: false });
  };

  inviteMember = () => {
    const { currentTeam } = store;
    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    this.setState({ inviteMemberOpen: true });
  };

  removeMember = event => {
    const { currentTeam } = store;
    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    const userId = event.currentTarget.dataset.userid;
    if (!userId) {
      notify('Select user');
      return;
    }

    confirm({
      message: 'Are you sure?',
      onAnswer: async answer => {
        if (answer) {
          try {
            await currentTeam.removeMember(userId);
          } catch (error) {
            notify(error);
          }
        }
      },
    });
  };

  render() {
    const { currentTeam, currentUser } = store;
    const isTL = currentUser._id === currentTeam.teamLeaderId;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div>Team not selected</div>;
    }

    return (
      <div style={{ padding: '0px 0px 0px 20px' }}>
        <h2>Setting for "{currentTeam.name}" team</h2>

        <p>TODO: Edit team info (name, avatar)</p>

        <h4>Team members</h4>
        <ul>
          {Array.from(currentTeam.members.values()).map(m => (
            <li key={m._id}>
              {m.displayName}{' '}
              {isTL && m._id !== currentUser._id ? (
                <Button data-userid={m._id} variant="raised" onClick={this.removeMember}>
                  Remove member
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        <p>TODO: Show pending invitations</p>
        <p>
          <Button variant="raised" color="primary" onClick={this.inviteMember}>
            Invite member
          </Button>
        </p>

        <InviteMember open={this.state.inviteMemberOpen} onClose={this.handleInviteMemberClose} />
      </div>
    );
  }
}

export default withAuth(withLayout(observer(Settings)));
