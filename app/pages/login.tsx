import React from 'react';
import Head from 'next/head';
import { observer } from 'mobx-react';

import LoginButton from '../components/common/LoginButton';
import withAuth from '../lib/withAuth';
import withLayout from '../lib/withLayout';

class Login extends React.Component<{ next?: string }> {
  static getInitialProps({ query }) {
    const { next } = query;

    return { next };
  }

  render() {
    return (
      <div style={{ textAlign: 'center', margin: '0 20px' }}>
        <Head>
          <title>Log in to SaaS by Async</title>
          <meta name="description" content="Login page for saas-app.async-await.com" />
        </Head>
        <br />
        <p style={{ margin: '45px auto', fontSize: '44px', fontWeight: 400 }}>Log in</p>
        <p>You’ll be logged in for 14 days unless you log out manually.</p>
        <br />

        <LoginButton next={this.props.next} />
      </div>
    );
  }
}

export default withAuth(withLayout(observer(Login)), { logoutRequired: true });