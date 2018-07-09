import * as React from 'react';
import { inject, observer } from 'mobx-react';

import Head from 'next/head';
import Router from 'next/router';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';

import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';
import withLayout from '../lib/withLayout';
import notify from '../lib/notifier';
import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../lib/api/team-member';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

type MyProps = { store: Store; isTL: boolean };

class CreateTeam extends React.Component<MyProps> {
  state = {
    newName: '',
    newAvatarUrl: 'https://storage.googleapis.com/async-await/default-user.png?v=1',
    disabled: false,
  };

  onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { newName } = this.state;

    if (!newName) {
      notify('Team name is required.');
      return;
    }

    const file = document.getElementById('upload-file').files[0];
    if (file == null) {
      notify('Team logo is required.');
      return;
    }

    try {
      this.setState({ disabled: true });

      const defaultAvatarUrl = 'https://storage.googleapis.com/async-await/default-user.png?v=1';
      const team = await this.props.store.addTeam({
        name: newName,
        avatarUrl: defaultAvatarUrl,
      });

      console.log(`Returned to client: ${team._id}, ${team.name}, ${team.slug}`);

      const bucket = 'saas-teams-avatars';
      const prefix = team.slug;

      const responseFromApiServerForUpload = await getSignedRequestForUpload({
        file,
        prefix,
        bucket,
        acl: 'public-read',
      });
      await uploadFileUsingSignedPutRequest(file, responseFromApiServerForUpload.signedRequest, {
        'Cache-Control': 'max-age=2592000',
      });

      const properAvatarUrl = responseFromApiServerForUpload.url;

      await team.edit({ name: team.name, avatarUrl: properAvatarUrl });

      this.setState({
        newName: '',
        newAvatarUrl: 'https://storage.googleapis.com/async-await/default-user.png?v=1',
      });

      document.getElementById('upload-file').value = '';

      Router.push(`/team/${team.slug}/d`);

      notify('You successfully created Team.');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  previewAvatar = () => {
    const file = document.getElementById('upload-file').files[0];
    if (!file) {
      return;
    }

    var reader = new FileReader();

    reader.onload = e => {
      this.setState({ newAvatarUrl: e.target.result });
    };

    reader.readAsDataURL(file);
  };

  render() {
    const { newAvatarUrl } = this.state;

    return (
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Create Team</title>
          <meta name="description" content="Create a new Team" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={12} xs={12} style={styleGridItem}>
            <h3>Create team</h3>
            <p />
            <form onSubmit={this.onSubmit}>
              <h4>Team name</h4>
              <TextField
                value={this.state.newName}
                label="Type your team's name."
                helperText="Team name as seen by your team members."
                onChange={event => {
                  this.setState({ newName: event.target.value });
                }}
              />
              <p />
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
                  Select team logo
                </Button>
              </label>
              <input
                accept="image/*"
                name="upload-file"
                id="upload-file"
                type="file"
                style={{ display: 'none' }}
                onChange={this.previewAvatar}
              />
              <br />
              <br />
              <br />
              <Button variant="raised" color="primary" type="submit" disabled={this.state.disabled}>
                Create new team
              </Button>
            </form>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(inject('store')(observer(CreateTeam)), { teamRequired: false }));
