import React from 'react';

import Button from '@material-ui/core/Button';

import { styleLoginButton } from '../../lib/sharedStyles';

// TS errors: https://github.com/mui-org/material-ui/issues/8198

const dev = process.env.NODE_ENV !== 'production';
const LOGIN_URL = dev ? 'http://localhost:8000' : 'https://saas-api.async-await.com';

class LoginButton extends React.PureComponent<{ next?: string; invitationToken?: string }> {
  render() {
    const { next, invitationToken } = this.props;

    let url = `${LOGIN_URL}/auth/google`;

    if (next && invitationToken) {
      url += `?next=${url}&invitationToken=${invitationToken}`;
    } else if (next) {
      url += `?next=${url}`;
    }

    return (
      <Button variant="raised" style={styleLoginButton} href={url}>
        <img src="https://storage.googleapis.com/nice-future-2156/G.svg" alt="Log in with Google" />
        &nbsp;&nbsp;&nbsp; Log in with Google
      </Button>
    );
  }
}

export default LoginButton;
