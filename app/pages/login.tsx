import Head from 'next/head';
import { observer } from 'mobx-react';

import LoginButton from '../components/common/LoginButton';
import withAuth from '../lib/withAuth';
import withLayout from '../lib/withLayout';

function Login() {
  return (
    <div style={{ textAlign: 'center', margin: '0 20px' }}>
      <Head>
        <title>Log in to Builder Book</title>
        <meta name="description" content="Login page for builderbook.org" />
      </Head>
      <br />
      <p style={{ margin: '45px auto', fontSize: '44px', fontWeight: 400 }}>Log in</p>
      <p>You’ll be logged in for 14 days unless you log out manually.</p>
      <br />

      <LoginButton />
    </div>
  );
}

export default withAuth(withLayout(observer(Login)), { logoutRequired: true });
