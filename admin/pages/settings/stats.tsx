import * as React from 'react';
import Head from 'next/head';
import Grid from '@material-ui/core/Grid';

import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';
// import notify from '../../lib/notifier';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

type MyProps = { store: Store; isTL: boolean; isAdmin: boolean };
type MyState = { disabled: boolean; removedTeams: string[] };

class Stats extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      removedTeams: [],
    };
  }

  render() {
    const { isAdmin, isTL } = this.props;

    console.log(isTL, isAdmin);

    if (!isAdmin) {
      return (
        <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
          <Head>
            <title>Stats</title>
            <meta name="description" content="Only the Admin can access this page" />
          </Head>
          <Grid container style={styleGrid}>
            <Grid item sm={12} xs={12} style={styleGridItem}>
              <h3>Admin Settings</h3>
              <p />
              <p>Only the Admin can access this page.</p>
            </Grid>
          </Grid>
        </div>
      );
    }
    return (
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Stats</title>
          <meta name="description" content="Stats" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={12} xs={12} style={styleGridItem}>
            <h3>Stats</h3>
            <p />
            <p>Some stats</p>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(Stats, { teamRequired: false }));
