import Button from '@material-ui/core/Button';
import React from 'react';

class LoginButton extends React.PureComponent {
  public render() {
    const url = `${process.env.NEXT_PUBLIC_URL_API}/auth/google`;

    console.log(url);

    return (
      <React.Fragment>
        <Button variant="contained" color="secondary" href={url}>
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
