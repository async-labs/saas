import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import React from 'react';

import { makeQueryString } from '../../lib/api/makeQueryString';

import { sendLoginToken } from '../../lib/api/public';
import notify from '../../lib/notifier';
import { styleLoginButton } from '../../lib/sharedStyles';

import { URL_API } from '../../lib/consts';

// TS errors: https://github.com/mui-org/material-ui/issues/8198

class LoginButton extends React.PureComponent<
  { next?: string; invitationToken?: string },
  { email: string }
> {
  public state = { email: '' };

  public render() {
    const { next, invitationToken } = this.props;

    let url = `${URL_API}/auth/google`;
    const qs = makeQueryString({ next, invitationToken });

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
        <hr style={{ width: '60px' }} /> <h4>OR</h4> <hr style={{ width: '60px' }} />
        <p />
        <br />
        <div>
          <form autoComplete="off" onSubmit={this.onSubmit}>
            <TextField
              required
              type="email"
              label="Email address"
              value={this.state.email}
              onChange={(event) => {
                this.setState({ email: event.target.value });
              }}
              style={{ width: '300px' }}
            />
            <p />
            <Button variant="contained" color="primary" type="submit">
              Log in with email
            </Button>
          </form>
          <br />
          <p />
        </div>
      </React.Fragment>
    );
  }

  private onSubmit = async (event) => {
    event.preventDefault();
    const { email } = this.state;

    if (!email) {
      notify('Email is required');
    }

    try {
      await sendLoginToken(email);
      this.setState({ email: '' });
      notify('We emailed you a login link.');
    } catch (error) {
      notify(error);
    }
  };
}

export default LoginButton;
