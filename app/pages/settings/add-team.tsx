import * as React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { TextField, Button } from '@material-ui/core';

import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';
import notify from '../../lib/notifier';
import { addTeam } from '../../lib/api/team-leader';

class AddTeam extends React.Component<{ store: Store }> {
  state = {
    newName: '',
    disabled: false,
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { newName: name } = this.state;
    if (!name) {
      notify('Name is required');
      return;
    }

    try {
      this.setState({ disabled: true });

      const { slug } = await addTeam({ name });

      this.setState({ newName: '' });

      Router.push(`/team/${slug}/projects`);
      notify('Team added successfully');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  handleCancel = () => {
    const { currentTeam } = this.props.store;
    Router.push(`/team/${currentTeam.slug}/settings`);
  }

  render() {
    return (
      <div style={{ padding: '0px 0px 0px 20px' }}>
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
          <Button variant="outlined" onClick={this.handleCancel}>Cancel</Button>{' '}
          <Button variant="raised" color="primary" type="submit" disabled={this.state.disabled}>
            Add team
          </Button>
        </form>
      </div>
    );
  }
}

export default withAuth(withLayout(AddTeam));
