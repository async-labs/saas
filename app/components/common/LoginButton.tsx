import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import React from 'react';

import { makeQueryString } from '../../lib/api/makeQueryString';
import env from '../../lib/env';

import { sendLoginToken } from '../../lib/api/public';
import notify from '../../lib/notifier';
import { styleLoginButton } from '../../lib/sharedStyles';

// TS errors: https://github.com/mui-org/material-ui/issues/8198

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_API } = env;
const LOGIN_URL = dev ? 'http://localhost:8000' : PRODUCTION_URL_API;

class LoginButton extends React.PureComponent<
  { next?: string; invitationToken?: string },
  { email: string }
> {
  public state = { email: '' };

  public render() {
    const { next, invitationToken } = this.props;

    let url = `${LOGIN_URL}/auth/google`;
    const qs = makeQueryString({ next, invitationToken });

    if (qs) {
      url += `?${qs}`;
    }

    return (
      <React.Fragment>
        <div>
          <form autoComplete="off" onSubmit={this.onSubmit}>
            <TextField
              required
              type="email"
              label="Email"
              value={this.state.email}
              onChange={event => {
                this.setState({ email: event.target.value });
              }}
            />
            <Button type="submit">Submit</Button>
          </form>
          <br />
          <p />
        </div>

        <Button variant="contained" style={styleLoginButton} href={url}>
          <img
            src="https://storage.googleapis.com/async-await-all/G.svg"
            alt="Log in with Google"
          />
          &nbsp;&nbsp;&nbsp; Log in with Google
        </Button>
      </React.Fragment>
    );
  }

  private onSubmit = async event => {
    event.preventDefault();
    const { email } = this.state;

    if (!email) {
      notify('Email is required');
    }

    try {
      await sendLoginToken(email);
      this.setState({ email: '' });
      notify('Sent login link. Please check your email.');
    } catch (error) {
      notify(error);
    }
  };
}

export default LoginButton;
