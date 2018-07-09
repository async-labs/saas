import * as React from 'react';
import Head from 'next/head';
import { observer } from 'mobx-react';

import Grid from '@material-ui/core/Grid';

import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';
import SettingList from '../../components/common/SettingList';


const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

type MyProps = { store: Store; isTL: boolean; teamSlug: string };

class TeamBilling extends React.Component<MyProps> {
  state = {
    newName: '',
    disabled: false,
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
          <meta name="description" content={`Billing for ${currentTeam.name}`} />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={store} isTL={isTL} />
          </Grid>
          <Grid item sm={10} xs={12} style={styleGridItem}>
            <h3>Team Billing</h3>
            <p />
            <p>Card</p>
            <p>Payment history</p>
            <p>Stop subscription</p>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(observer(TeamBilling)));
