import Button from '@material-ui/core/Button';
import React from 'react';

import { makeQueryString } from '../../lib/api/makeQueryString';

import { styleLoginButton } from '../../lib/sharedStyles';

class LoginButton extends React.PureComponent<
  { redirectAfterLogin?: string; invitationToken?: string },
  { email: string }
> {
  public state = { email: '' };

  public render() {
    const { redirectAfterLogin, invitationToken } = this.props;

    let url = `${process.env.URL_API}/auth/google`;
    const qs = makeQueryString({ redirectAfterLogin, invitationToken });

    if (qs) {
      url += `?${qs}`;
    }

    return (
      <React.Fragment>
        <Button variant="contained" style={styleLoginButton} href={url}>
          <img
            src="https://storage.googleapis.com/async-await-all/G.svg"
            alt="Log in with Google"
          />
          &nbsp;&nbsp;&nbsp; Log in with Google
        </Button>
        <p />
        <br />
      </React.Fragment>
    );
  }
}

export default LoginButton;
