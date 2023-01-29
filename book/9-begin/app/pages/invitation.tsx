import Avatar from '@material-ui/core/Avatar';
import { observer } from 'mobx-react';
import Error from 'next/error';
import Head from 'next/head';
import Router from 'next/router';
// import { NextPageContext } from 'next';
import React from 'react';

import LoginButton from '../components/common/LoginButton';
import Layout from '../components/layout';
import { getTeamByTokenApiMethod } from '../lib/api/public';
import { Team } from '../lib/store/team';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

class InvitationPageComp extends React.Component<{ store: Store; team: Team; token: string }> {
  public static async getInitialProps(ctx) {
    const { token } = ctx.query;
    if (!token) {
      return {};
    }

    try {
      const { team } = await getTeamByTokenApiMethod(token, ctx.req);

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
            src={`${
              team.avatarUrl || 'https://storage.googleapis.com/async-await/default-user.png?v=1'
            }`}
            alt="Team logo"
            style={{
              verticalAlign: 'middle',
              display: 'inline-flex',
            }}
          />{' '}
          <h2>{team.name}</h2>
          <p>
            Join <b>{team.name}</b> by logging in or signing up.
          </p>
          <br />
          <LoginButton invitationToken={token} />
        </div>
      </Layout>
    );
  }

  public async componentDidMount() {
    const { store, team, token } = this.props;

    const user = store.currentUser;

    if (user && team) {
      Router.push(
        `${process.env.NEXT_PUBLIC_URL_API}/logout?invitationToken=${token}`,
        `${process.env.NEXT_PUBLIC_URL_API}/logout`,
      );
    }
  }
}

// export async function getServerSideProps(context: NextPageContext) {
//   const { token } = context.query;

//   try {
//     const { team } = await getTeamByTokenApiMethod(token as string, context.req);

//     if (team && token) {
//       return { props: { team, token } };
//     } else {
//       return { props: {} };
//     }
//   } catch (error) {
//     console.log(error);
//     return { props: {} };
//   }
// }

// see our explanation for not using getServerSideProps at this time: https://github.com/async-labs/saas/issues/193

export default withAuth(observer(InvitationPageComp), { loginRequired: false });
