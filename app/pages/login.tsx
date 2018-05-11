import Head from 'next/head';
import Button from 'material-ui/Button';
// import PropTypes from 'prop-types';
import withAuth from '../lib/withAuth';
import withLayout from '../lib/withLayout';
import { styleLoginButton } from '../lib/sharedStyles';

// TS errors: https://github.com/mui-org/material-ui/issues/8198

const dev = process.env.NODE_ENV !== 'production';
const LOGIN_URL = dev ? 'http://localhost:8000' : 'https://api1.async-await.com';

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
      <Button variant="raised" style={styleLoginButton} href={`${LOGIN_URL}/auth/google`}>
        <img src="https://storage.googleapis.com/nice-future-2156/G.svg" alt="Log in with Google" />
        &nbsp;&nbsp;&nbsp; Log in with Google
      </Button>
    </div>
  );
}

export default withAuth(withLayout(Login), { logoutRequired: true });
