import React from 'react';
import { observer } from 'mobx-react';
import Avatar from '@material-ui/core/Avatar';
import Error from 'next/error';
import Router from 'next/router';

import LoginButton from '../components/common/LoginButton';
import { getInvitedTeamByToken } from '../lib/api/public';
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
    const { store, team } = this.props;

    const user = store.currentUser;

    if (user && team) {
      if (team.memberIds.includes(user._id)) {
        Router.push(`/projects?teamSlug=${team.slug}`, `/team/${team.slug}/projects`);
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
        <h2>
          <Avatar
            src={`${team.avatarUrl ||
              'https://storage.googleapis.com/async-await/async-logo-40.svg'}`}
            alt="Team logo"
            style={{
              margin: '10px auto 20px 0px',
              cursor: 'pointer',
              display: 'inline-flex',
            }}
          />{' '}
          {team.name}
        </h2>

        <p>Join {team.name} logging in with your Google account.</p>

        <LoginButton next={`/team/${team.slug}/projects`} invitationToken={token} />
      </div>
    );
  }
}

export default withAuth(withLayout(Invitation), { loginRequired: false });
