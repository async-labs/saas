import React from 'react';
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import { observer } from 'mobx-react';
import Router from 'next/router';

import withLayout from '../../lib/withLayout';
import withAuth from '../../lib/withAuth';
import { Store } from '../../lib/store';
import notify from '../../lib/notifier';
import confirm from '../../lib/confirm';
import InviteMember from '../../components/teams/InviteMember';

const dev = process.env.NODE_ENV !== 'production';
const LOG_OUT_URL = dev ? 'http://localhost:8000' : 'https://api1.async-await.com';

@observer
class Settings extends React.Component<{ teamSlug: string; store: Store }> {
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
    const { teamSlug, store } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== teamSlug) {
      store.setCurrentTeam(teamSlug);
    }
  }

  handleInviteMemberClose = () => {
    this.setState({ inviteMemberOpen: false });
  };

  inviteMember = () => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('Team have not selected');
      return;
    }

    this.setState({ inviteMemberOpen: true });
  };

  removeMember = event => {
    const { currentTeam } = this.props.store;
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
      title: 'Are you sure?',
      message: '',
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

  logout = () => {
    Router.push(`${LOG_OUT_URL}/logout`);
  };

  render() {
    const { store } = this.props;
    const { currentTeam, currentUser } = store;
    const isTL = currentUser._id === currentTeam.teamLeaderId;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div>Team not selected</div>;
    }

    return (
      <div style={{ padding: '0px 0px 0px 20px' }}>
        <h2>All Teams</h2>

        <Link href="/settings/add-team">
          <Button variant="raised">Add team</Button>
        </Link>

        <ul>
          {store.teams.map(t => (
            <li key={t._id}>
              <a>{t.name}</a>
            </li>
          ))}
        </ul>

        <hr />

        <h2>"{currentTeam.name}" Team</h2>

        <p>TODO: Edit team info (name, avatar)</p>

        <h4>Team members</h4>

        <p>
          <Button variant="outlined" onClick={this.inviteMember}>
            Invite member
          </Button>
        </p>
        <ul>
          {Array.from(currentTeam.members.values()).map(m => (
            <li key={m._id} style={{ padding: '10px' }}>
              {m.displayName}{' '}
              {isTL && m._id !== currentUser._id ? (
                <Button data-userid={m._id} variant="outlined" onClick={this.removeMember}>
                  Remove member
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        <p>TODO: Show pending invitations</p>

        <InviteMember open={this.state.inviteMemberOpen} onClose={this.handleInviteMemberClose} />

        <p />
        <hr />
        <h3>Payments</h3>
        <hr />
        <br />

        <Button variant="outlined" onClick={this.logout}>
          Log out
        </Button>
      </div>
    );
  }
}

export default withAuth(withLayout(Settings));
