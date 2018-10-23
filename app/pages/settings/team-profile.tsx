import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Head from 'next/head';
import NProgress from 'nprogress';
import * as React from 'react';

import SettingList from '../../components/common/SettingList';
import Layout from '../../components/layout';

import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../../lib/api/team-member';
import notify from '../../lib/notifier';
import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';

import env from '../../lib/env';

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

  public onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { newName, newAvatarUrl } = this.state;
    const { currentTeam } = this.props.store;

    if (!newName) {
      notify('Team name is required');
      return;
    }

    NProgress.start();

    try {
      this.setState({ disabled: true });

      await currentTeam.edit({ name: newName, avatarUrl: newAvatarUrl });

      notify('You successfully updated Team name.');
    } catch (error) {
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

  public uploadFile = async () => {
    const { store } = this.props;
    const { currentTeam } = store;

    const fileElm = document.getElementById('upload-file') as HTMLFormElement;
    const file = fileElm.files[0];

    if (file == null) {
      notify('No file selected for upload.');
      return;
    }

    NProgress.start();

    fileElm.value = '';

    const { BUCKET_FOR_TEAM_AVATARS } = env;
    const bucket = BUCKET_FOR_TEAM_AVATARS;

    const prefix = `${currentTeam.slug}`;

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

      await currentTeam.edit({ name: currentTeam.name, avatarUrl: this.state.newAvatarUrl });

      notify('You successfully uploaded new Team logo.');
    } catch (error) {
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

  public render() {
    const { store } = this.props;
    const { currentTeam, currentUser } = store;
    const { newName, newAvatarUrl } = this.state;
    const isTL = currentTeam && currentUser && currentUser._id === currentTeam.teamLeaderId;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
          <div style={{ padding: '20px' }}>
            <p>You did not select any team.</p>
            <p>
              To access this page, please select an existing team or create a new team if you have
              no teams.
            </p>
          </div>
        </Layout>
      );
    }

    if (!isTL) {
      return (
        <Layout {...this.props}>
          <Head>
            <title>Profile for {currentTeam.name}</title>
            <meta name="description" content="Only the Team Leader can access this page" />
          </Head>
          <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
            <Grid container style={styleGrid}>
              <Grid item sm={2} xs={12} style={styleGridItem}>
                <SettingList store={store} isTeamSettings={true} />
              </Grid>
              <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
                <h3>Team Profile</h3>
                <p />
                <p>Only the Team Leader can access this page.</p>
                <p>Create your own team to become a Team Leader.</p>
              </Grid>
            </Grid>
          </div>
        </Layout>
      );
    }
    return (
      <Layout {...this.props}>
        <Head>
          <title>Setting for {currentTeam.name}</title>
          <meta name="description" content={`Settings for ${currentTeam.name}`} />
        </Head>
        <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTeamSettings={true} />
            </Grid>
            <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
              <h3>Team Profile</h3>
              <p />
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
            </Grid>
          </Grid>
          <br />
        </div>
      </Layout>
    );
  }
}

export default withAuth(TeamProfile);
