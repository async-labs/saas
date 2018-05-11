import React from 'react';
import { observer } from 'mobx-react';
import Button from 'material-ui/Button';
import Link from 'next/link';
import Router from 'next/router';

import { getStore } from '../lib/store';
import {
  getInvitationTeamBySlug,
  acceptInvitation,
  cancelInvitation,
} from '../lib/api/team-leader';
import withAuth from '../lib/withAuth';

const store = getStore();
class Invitation extends React.Component<{ url: { asPath: string; query: { teamSlug: string } } }> {
  state = {
    isLoading: true,
    teamName: null,
    invitationId: null,
    error: '',
  };

  async componentWillReact() {
    const { url } = this.props;
    const { currentUser } = store;
    const { teamName, isLoading } = this.state;

    if (teamName || !isLoading || !currentUser || !currentUser.email) {
      return;
    }

    if (!url || !url.query || !url.query.teamSlug) {
      return;
    }

    try {
      const res = await getInvitationTeamBySlug(url.query.teamSlug);
      const { teamName, invitationId } = res;
      this.setState({ teamName, invitationId, isLoading: false });
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false, error: error.message || error.toString() });
    }
  }

  accept = async () => {
    const { url } = this.props;
    if (!url || !url.query || !url.query.teamSlug) {
      return;
    }

    try {
      await acceptInvitation(url.query.teamSlug);
      store.loadTeams();
      Router.push('/');
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false, error: error.message || error.toString() });
    }
  };

  cancel = async () => {
    const { url } = this.props;
    if (!url || !url.query || !url.query.teamSlug) {
      return;
    }

    try {
      await cancelInvitation(url.query.teamSlug);
      Router.push('/');
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: false, error: error.message || error.toString() });
    }
  };

  handleInviteMemberClose = () => {
    this.setState({ inviteMemberOpen: false });
  };

  render() {
    const { currentUser, isLoggingIn } = store;
    const { asPath } = this.props.url;
    const { isLoading, error, teamName } = this.state;

    if (isLoggingIn) {
      return 'logging in';
    }

    if (!currentUser) {
      return (
        <div>
          <Link
            href={{ pathname: '/public/login', query: { next: asPath } }}
            as={{ pathname: '/login', query: { next: asPath } }}
          >
            <a>Signup or Login</a>
          </Link>{' '}
          to accept invitation
        </div>
      );
    }

    if (isLoading) {
      return 'loading...';
    }

    if (error) {
      return <span style={{ color: 'red' }}>{error}</span>;
    }

    return (
      <div>
        <h2>You are invited to "{teamName}" team.</h2>

        <Button variant="raised" color="primary" onClick={this.accept}>
          Accept
        </Button>
        <Button onClick={this.cancel}>Cancel</Button>
      </div>
    );
  }
}

export default withAuth(observer(Invitation), { loginRequired: false });
