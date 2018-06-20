import React from 'react';

import Button from '@material-ui/core/Button';
import env from '../../lib/env';

import { styleLoginButton } from '../../lib/sharedStyles';

// TS errors: https://github.com/mui-org/material-ui/issues/8198

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_API } = env;
const LOGIN_URL = dev ? 'http://localhost:8000' : PRODUCTION_URL_API;

class LoginButton extends React.PureComponent<{ next?: string; invitationToken?: string }> {
  render() {
    const { next, invitationToken } = this.props;

    let url = `${LOGIN_URL}/auth/google`;

    if (next && invitationToken) {
      url += `?next=${next}&invitationToken=${invitationToken}`;
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
