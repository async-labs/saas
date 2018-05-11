import * as React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { TextField, Button } from 'material-ui';

import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';
import notify from '../../lib/notifier';
import { addTeam } from '../../lib/api/team-leader';

class AddTeam extends React.Component {
  state = {
    newName: '',
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { newName: name } = this.state;
    if (!name) {
      notify('Name is required');
      return;
    }

    try {
      await addTeam({ name });
      this.setState({ newName: '' });
      Router.push('/');
    } catch (error) {
      console.log(error);
      notify(error);
    }
  };

  render() {
    return (
      <div>
        <Head>
          <title>Add Team</title>
          <meta name="description" content="description" />
        </Head>
        <h2>Add team</h2>
        <form onSubmit={this.onSubmit}>
          <TextField
            value={this.state.newName}
            label="Name"
            helperText="Add team's name"
            onChange={event => {
              this.setState({ newName: event.target.value });
            }}
          />
          <p />
          <Button variant="raised" color="primary" type="submit">
            Add team
          </Button>
        </form>
      </div>
    );
  }
}

export default withAuth(withLayout(AddTeam));
