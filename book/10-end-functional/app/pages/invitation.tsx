import Avatar from '@mui/material/Avatar';
import { observer } from 'mobx-react';
import Error from 'next/error';
import Head from 'next/head';
import Router from 'next/router';
import { NextPageContext } from 'next';

import React from 'react';
import { useEffect } from 'react';

import LoginButton from '../components/common/LoginButton';
import Layout from '../components/layout';
import { getTeamByTokenApiMethod } from '../lib/api/public';
import { Team } from '../lib/store/team';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

const dev = process.env.NODE_ENV !== 'production';

type Props = {
  store: Store;
  isMobile: boolean;
  firstGridItem: boolean;
  teamRequired: boolean;
  team: Team;
  token: string;
};

function InvitationPageComp({ store, isMobile, firstGridItem, teamRequired, team, token }: Props) {
  useEffect(() => {
    const user = store.currentUser;

    if (user && team) {
      Router.push(
        `${
          dev ? process.env.NEXT_PUBLIC_URL_API : process.env.NEXT_PUBLIC_PRODUCTION_URL_API
        }/logout?invitationToken=${token}`,
        `${
          dev ? process.env.NEXT_PUBLIC_URL_API : process.env.NEXT_PUBLIC_PRODUCTION_URL_API
        }/logout`,
      );
    }
  }, []);

  if (!team) {
    return <Error statusCode={404} />;
  }

  const user = store.currentUser;

  if (user) {
    return null;
  }

  return (
    <Layout
      store={store}
      isMobile={isMobile}
      teamRequired={teamRequired}
      firstGridItem={firstGridItem}
    >
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

// InvitationPageComp.getInitialProps = async (ctx: NextPageContext) => {
// const { token } = ctx.query;

//   if (!token) {
//     return {};
//   }

//   try {
//     const { team } = await getTeamByTokenApiMethod(token as string, ctx.req);

//     return { team, token };
//   } catch (error) {
//     console.log(error);
//     return {};
//   }
// };

export async function getServerSideProps(context: NextPageContext) {
  const { token } = context.query;

  try {
    const { team } = await getTeamByTokenApiMethod(token as string, context.req);

    if (team && token) {
      return { props: { team, token } };
    } else {
      return { props: {} };
    }
  } catch (error) {
    console.log(error);
    return { props: {} };
  }
}

export default withAuth(observer(InvitationPageComp), { loginRequired: false });
