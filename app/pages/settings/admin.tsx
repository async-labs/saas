import * as React from 'react';
import Head from 'next/head';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';
import SettingList from '../../components/common/SettingList';
import notify from '../../lib/notifier';
import { removeOldData } from '../../lib/api/admin';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

type MyProps = { store: Store; isTL: boolean; isAdmin: boolean };
type MyState = { disabled: boolean; removedTeams: string[] };

class AdminSettings extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      removedTeams: [],
    };
  }

  removeOldData = async () => {
    try {
      this.setState({ disabled: true });

      const removedTeams = await removeOldData();

      this.setState({ removedTeams });

      notify('You successfully removed old data.');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  render() {
    const { store, isAdmin, isTL } = this.props;
    const { removedTeams } = this.state;

    console.log(isTL, isAdmin);

    if (!isAdmin) {
      return (
        <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
          <Head>
            <title>Admin Settings</title>
            <meta name="description" content="Only the Admin can access this page" />
          </Head>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTL={isTL} isAdmin={isAdmin} />
            </Grid>
            <Grid item sm={10} xs={12} style={styleGridItem}>
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
          <title>Admin Settings</title>
          <meta name="description" content="Admin Settings" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={store} isTL={isTL} isAdmin={isAdmin} />
          </Grid>
          <Grid item sm={10} xs={12} style={styleGridItem}>
            <h3>Remove old data</h3>
            <p />
            <Button
              variant="outlined"
              color="primary"
              disabled={this.state.disabled}
              onClick={this.removeOldData}
            >
              Remove old data
            </Button>
            <br />
            {!removedTeams ? (
              <div>
                <b>You successfully removed following Teams:</b>
                <ul>{removedTeams.map(t => <li>{t}</li>)}</ul>{' '}
              </div>
            ) : null}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(AdminSettings, { teamRequired: false }));
