import * as React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { Grid } from '@material-ui/core';

import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';
import SettingList from '../../components/common/SettingList';

import notify from '../../lib/notifier';
import { addTeam } from '../../lib/api/team-leader';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

type MyProps = { store: Store; teamSlug: string };

class TeamConstraints extends React.Component<MyProps> {
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

  render() {
    // const { currentUser } = this.props.store;
    return (
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Team Constraints</title>
          <meta name="description" content="description" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={this.props.store} />
          </Grid>
          <Grid item sm={10} xs={12} style={styleGridItem}>
            <h3>Team Constraints</h3>
            <br />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(TeamConstraints));
