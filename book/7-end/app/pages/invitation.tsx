import Avatar from '@material-ui/core/Avatar';
import { observer } from 'mobx-react';
import Error from 'next/error';
import Head from 'next/head';
import Router from 'next/router';
import React from 'react';

import LoginButton from '../components/common/LoginButton';
import Layout from '../components/layout';
import { acceptAndGetInvitedTeamByTokenApiMethod, removeInvitationIfMemberAddedApiMethod } from '../lib/api/public';
import { Team } from '../lib/store/team';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

type MyProps = { store: Store; team: Team; token: string };

class Invitation extends React.Component<MyProps> {
  public static async getInitialProps(ctx) {
    const { token } = ctx.query;
    if (!token) {
      return {};
    }

    try {
      const { team } = await acceptAndGetInvitedTeamByTokenApiMethod(token, ctx.req);

      return { team, token };
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  public render() {
    const { team, token, store } = this.props;

    if (!team) {
      return <Error statusCode={404} />;
    }

    const user = store.currentUser;

    if (user) {
      return null;
    }

    return (
      <Layout {...this.props}>
        <Head>
          <title>Invitation to {team.name}</title>
          <meta name="description" content={`Invitation to join ${team.name}`} />
        </Head>
        <div style={{ textAlign: 'center', margin: '0 20px' }}>
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
          <LoginButton invitationToken={token} />
        </div>
      </Layout>
    );
  }

  public componentDidMount() {
    const { store, team, token } = this.props;

    const user = store.currentUser;

    if (user && team) {
      if (team.memberIds.includes(user._id)) {
        removeInvitationIfMemberAddedApiMethod(token);
        Router.push(`/discussion?teamSlug=${team.slug}`, `/team/${team.slug}/discussions`);
      } else {
        Router.push('/');
      }
    }
  }
}

export default withAuth(observer(Invitation), { loginRequired: false });
