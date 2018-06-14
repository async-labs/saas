import * as React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import NProgress from 'nprogress';

import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';
import SettingList from '../../components/common/SettingList';
import notify from '../../lib/notifier';
import { updateTeam } from '../../lib/api/team-leader';
import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../../lib/api/team-member';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

type MyProps = { store: Store; isTL: boolean; teamSlug: string };
type MyState = { newName: string; newAvatarUrl: string; disabled: boolean };

class TeamProfile extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);

    this.state = {
      newName: this.props.store.currentTeam.name,
      newAvatarUrl: this.props.store.currentTeam.avatarUrl,
      disabled: false,
    };
  }

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const teamId = this.props.store.currentTeam._id;
    const { newName, newAvatarUrl } = this.state;

    if (!newName) {
      notify('Team name is required');
      return;
    }

    try {
      this.setState({ disabled: true });

      const updatedTeam = await updateTeam({ teamId, name: newName, avatarUrl: newAvatarUrl });

      // TODO: MobX instead of Router.push
      Router.push(`/team/${updatedTeam.slug}/settings/team-settings`);
      notify('You successfully updated team profile.');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  uploadFile = async () => {
    const { store } = this.props;
    const { currentTeam } = store;
    const teamId = this.props.store.currentTeam._id;

    const file = document.getElementById('upload-file').files[0];
    document.getElementById('upload-file').value = '';
    const bucket = 'saas-teams-avatars';
    const prefix = `${currentTeam.slug}`;

    if (file == null) {
      return notify('No file selected.');
    }

    NProgress.start();

    try {
      this.setState({ disabled: true });

      const responseFromApiServerForUpload = await getSignedRequestForUpload({
        file,
        prefix,
        bucket,
        acl: 'public-read',
      });

      await uploadFileUsingSignedPutRequest(file, responseFromApiServerForUpload.signedRequest, {
        'Cache-Control': 'max-age=2592000',
      });

      this.setState({
        newAvatarUrl: responseFromApiServerForUpload.url,
      });

      await updateTeam({ teamId, name: currentTeam.name, avatarUrl: this.state.newAvatarUrl });

      NProgress.done();
      notify('You successfully uploaded new team logo.');
    } catch (error) {
      console.log(error);
      notify(error);
      NProgress.done();
    } finally {
      this.setState({ disabled: false });
    }
  };

  // TODO: Test Connect Github button when working on Projects

  render() {
    const { store, isTL } = this.props;
    const { currentUser, currentTeam } = store;
    const { newName, newAvatarUrl } = this.state;

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
            <title>Team Settings</title>
            <meta name="description" content="description" />
          </Head>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTL={isTL} />
            </Grid>
            <Grid item sm={10} xs={12} style={styleGridItem}>
              <h3>Team Settings</h3>
              <p>Only Team Leader can access this page.</p>
              <p>Create your own team to become Team Leader.</p>
            </Grid>
          </Grid>
        </div>
      );
    }
    return (
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Team Settings</title>
          <meta name="description" content="description" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={store} isTL={isTL} />
          </Grid>
          <Grid item sm={10} xs={12} style={styleGridItem}>
            <h3>Team Settings</h3>
            <p />
            <h4>Connect Github profile</h4>
            {currentUser && !currentUser.isGithubConnected ? (
              <a href="/auth/github">
                <Button variant="outlined" color="primary">
                  Connect Github
                </Button>
              </a>
            ) : null}
            <br />
            <br />
            <br />
            <form onSubmit={this.onSubmit}>
              <h4>Team name</h4>
              <TextField
                value={newName}
                helperText="Team name as seen by your team members"
                onChange={event => {
                  this.setState({ newName: event.target.value });
                }}
              />
              <br />
              <br />
              <Button
                variant="outlined"
                color="primary"
                type="submit"
                disabled={this.state.disabled}
              >
                Update name
              </Button>
            </form>
            <br />
            <br />
            <h4>Team logo</h4>
            <Avatar
              src={newAvatarUrl}
              style={{
                display: 'inline-flex',
                verticalAlign: 'middle',
                marginRight: 20,
                width: 60,
                height: 60,
              }}
            />
            <label htmlFor="upload-file">
              <Button variant="outlined" color="primary" component="span">
                Update logo
              </Button>
            </label>
            <input
              accept="image/*"
              name="upload-file"
              id="upload-file"
              type="file"
              style={{ display: 'none' }}
              onChange={this.uploadFile}
            />
            <br />
            <br />
            <br />
            <h4>Export team's data</h4>
            <a href={`/export/${currentTeam.slug}`}>
              <Button variant="outlined" color="primary">
                Export data
              </Button>
            </a>
            <br />
            <br />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(TeamProfile));
