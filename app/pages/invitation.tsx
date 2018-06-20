import Head from 'next/head';
import React from 'react';
import { observer } from 'mobx-react';
import Avatar from '@material-ui/core/Avatar';
import Error from 'next/error';
import Router from 'next/router';

import LoginButton from '../components/common/LoginButton';
import { getInvitedTeamByToken, removeInvitationIfMemberAdded } from '../lib/api/public';
import { Store, Team } from '../lib/store';
import withAuth from '../lib/withAuth';
import withLayout from '../lib/withLayout';

@observer
class Invitation extends React.Component<{ store: Store; team: Team; token: string }> {
  static async getInitialProps({ query }) {
    const { token } = query;
    if (!token) {
      return {};
    }

    try {
      const { team } = await getInvitedTeamByToken(token);

      return { team, token };
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  componentDidMount() {
    const { store, team, token } = this.props;

    const user = store.currentUser;

    if (user && team) {
      if (team.memberIds.includes(user._id)) {
        removeInvitationIfMemberAdded(token);
        Router.push(
          `/topics/detail?teamSlug=${team.slug}&topicSlug=projects`,
          `/team/${team.slug}/t/projects`,
        );
      } else {
        Router.push(`/`);
      }
    }
  }

  render() {
    const { team, token, store } = this.props;

    if (!team) {
      return <Error statusCode={404} />;
    }

    const user = store.currentUser;

    if (user) {
      return null;
    }

    return (
      <div style={{ textAlign: 'center', margin: '0 20px' }}>
        <Head>
          <title>Team Invitation: {team.name}</title>
          <meta name="description" content={`Invitation to join ${team.name}`} />
        </Head>
        <br />
        <br />
        <Avatar
          src={`${team.avatarUrl ||
            'https://storage.googleapis.com/async-await/async-logo-40.svg'}`}
          alt="Team logo"
          style={{
            verticalAlign: 'middle',
            display: 'inline-flex',
          }}
        />{' '}
        <h2>{team.name}</h2>
        <p>
          Join <b>{team.name}</b> by logging in with your Google account.
        </p>
        <br />
        <LoginButton next={`/team/${team.slug}/t/projects`} invitationToken={token} />
      </div>
    );
  }
}

export default withAuth(withLayout(Invitation), { loginRequired: false });
