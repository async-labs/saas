import * as React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { observer } from 'mobx-react';

import Grid from '@material-ui/core/Grid';

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

type MyProps = { store: Store; isTL: boolean; teamSlug: string };

@observer
class TeamBilling extends React.Component<MyProps> {
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
    const { store, isTL } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <div style={{ padding: '20px' }}>
          <p>You did not select any team.</p>
          <p>
            To access this page, please select existing team or create new team if you have no
            teams.
          </p>
        </div>
      );
    }

    if (!isTL) {
      return (
        <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
          <Head>
            <title>Team Billing</title>
            <meta name="description" content="Only the Team Leader can access this page" />
          </Head>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTL={isTL} />
            </Grid>
            <Grid item sm={10} xs={12} style={styleGridItem}>
              <h3>Team Billing</h3>
              <p>Only the Team Leader can access this page.</p>
              <p>Create your own team to become a Team Leader.</p>
            </Grid>
          </Grid>
        </div>
      );
    }

    return (
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Team Billing</title>
          <meta name="description" content="Your billing settings for Async" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={store} isTL={isTL} />
          </Grid>
          <Grid item sm={10} xs={12} style={styleGridItem}>
            <h3>Team Billing</h3>
            <br />
            <p>Card</p>
            <p>Payment history</p>
            <p>Stop subscription</p>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(TeamBilling));
