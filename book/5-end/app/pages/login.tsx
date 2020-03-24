import Head from 'next/head';
import React from 'react';
import LoginButton from '../components/common/LoginButton';
import Layout from '../components/layout';
import withAuth from '../lib/withAuth';

class Login extends React.Component<{ redirectAfterLogin?: string; firstGridItem: boolean }> {
  public static getInitialProps({ query }) {
    const { redirectAfterLogin } = query;

    return { redirectAfterLogin };
  }

  public render() {
    return (
      <Layout {...this.props}>
        <div style={{ textAlign: 'center', margin: '0 20px' }}>
          <Head>
            <title>Log in to SaaS by Async</title>
            <meta name="description" content="Login page for saas-app.builderbook.org" />
          </Head>
          <br />
          <p style={{ margin: '45px auto', fontSize: '44px', fontWeight: 400 }}>Log in</p>
          <p>You’ll be logged in for 14 days unless you log out manually.</p>
          <br />

          <LoginButton redirectAfterLogin={this.props.redirectAfterLogin} />
        </div>
      </Layout>
    );
  }
}

export default withAuth(Login, { logoutRequired: true });
