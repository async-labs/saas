import Head from 'next/head';
import React from 'react';
import LoginButton from '../components/common/LoginButton';
import Layout from '../components/layout';
import withAuth from '../lib/withAuth';
import { Store } from '../lib/store';

type Props = {
  store: Store;
  isMobile: boolean;
  firstGridItem: boolean;
};

function Login({ store, isMobile, firstGridItem }: Props) {
  return (
    <Layout store={store} isMobile={isMobile} firstGridItem={firstGridItem}>
      <div style={{ textAlign: 'center', margin: '0 20px' }}>
        <Head>
          <title>Log in or Sign up to SaaS boilerplate</title>
          <meta
            name="description"
            content="Login and signup page for SaaS boilerplate demo by Async"
          />
        </Head>
        <br />
        <p style={{ margin: '45px auto', fontSize: '44px', fontWeight: 400 }}>Log in or Sign up</p>
        <p>You’ll be logged in for 14 days unless you log out manually.</p>
        <br />
        <LoginButton />
      </div>
    </Layout>
  );
}

export default withAuth(Login, { logoutRequired: true });
