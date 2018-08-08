import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Head from 'next/head';
import NProgress from 'nprogress';
import * as React from 'react';

import SettingList from '../../components/common/SettingList';
import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../../lib/api/team-member';
import notify from '../../lib/notifier';
import { resizeImage } from '../../lib/resizeImage';
import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #707070 solid',
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

  public render() {
    const { store, isTL } = this.props;
    const { currentTeam } = store;
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
            <title>Team Profile</title>
            <meta name="description" content="description" />
          </Head>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTL={isTL} />
            </Grid>
            <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
              <h3>Team Profile</h3>
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
          <title>Team Profile</title>
          <meta name="description" content="description" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={store} isTL={isTL} />
          </Grid>
          <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
            <h3>Team Profile</h3>
            <p />
            <form onSubmit={this.onSubmit}>
              <h4>Team name</h4>
              <TextField
                autoComplete="off"
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

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { newName, newAvatarUrl } = this.state;
    const { currentTeam } = this.props.store;

    if (!newName) {
      notify('Team name is required');
      return;
    }

    try {
      this.setState({ disabled: true });

      await currentTeam.edit({ name: newName, avatarUrl: newAvatarUrl });

      notify('You successfully updated Team name.');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  private uploadFile = async () => {
    const { store } = this.props;
    const { currentTeam } = store;

    const file = document.getElementById('upload-file').files[0];
    document.getElementById('upload-file').value = '';
    const bucket = 'async-teams-avatars';
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

      const resizedFile = await resizeImage(file, 128, 128);

      await uploadFileUsingSignedPutRequest(
        resizedFile,
        responseFromApiServerForUpload.signedRequest,
        {
          'Cache-Control': 'max-age=2592000',
        },
      );

      this.setState({
        newAvatarUrl: responseFromApiServerForUpload.url,
      });

      await currentTeam.edit({ name: currentTeam.name, avatarUrl: this.state.newAvatarUrl });

      NProgress.done();
      notify('You successfully uploaded new Team logo.');
    } catch (error) {
      console.log(error);
      notify(error);
      NProgress.done();
    } finally {
      this.setState({ disabled: false });
    }
  };
}

export default withAuth(withLayout(TeamProfile));
