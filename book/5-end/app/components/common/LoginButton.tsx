import Button from '@material-ui/core/Button';
import React from 'react';

import { makeQueryString } from '../../lib/api/makeQueryString';

import { styleLoginButton } from '../../lib/sharedStyles';

type MyProps = { redirectAfterLogin?: string };

type MyState = { email: string };

class LoginButton extends React.PureComponent<MyProps, MyState> {
  public state = { email: '' };

  public render() {
    const { redirectAfterLogin } = this.props;

    let url = `${process.env.URL_API}/auth/google`;
    const qs = makeQueryString({ redirectAfterLogin });

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
