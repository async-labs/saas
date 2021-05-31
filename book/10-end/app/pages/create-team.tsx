import { inject, observer } from 'mobx-react';
import * as React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Head from 'next/head';
import Router from 'next/router';

import {
  getSignedRequestForUploadApiMethod,
  uploadFileUsingSignedPutRequestApiMethod,
} from '../lib/api/team-member';
import notify from '../lib/notify';
import { resizeImage } from '../lib/resizeImage';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

import Layout from '../components/layout';

const styleGrid = {
  height: '100%',
};

type Props = { store: Store; isMobile: boolean; teamRequired: boolean };

type State = { newName: string; newAvatarUrl: string; disabled: boolean };

class CreateTeam extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      newName: '',
      newAvatarUrl: 'https://storage.googleapis.com/async-await/default-user.png?v=1',
      disabled: false,
    };
  }

  public render() {
    const { newAvatarUrl } = this.state;

    console.log(this.props.store);

    return (
      <Layout {...this.props}>
        <Head>
          <title>Create Team</title>
          <meta name="description" content="Create a new Team at SaaS Boilerplate" />
        </Head>
        <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
          <Grid container style={styleGrid}>
            <Grid
              item
              sm={12}
              xs={12}
              style={{ padding: this.props.isMobile ? '0px' : '0px 30px' }}
            >
              <h3>Create team</h3>
              <p />
              <form onSubmit={this.onSubmit}>
                <h4>Team name</h4>
                <TextField
                  value={this.state.newName}
                  label="Type your team's name."
                  helperText="Team name as seen by your team members."
                  onChange={(event) => {
                    this.setState({ newName: event.target.value });
                  }}
                />
                <p />
                <h4 style={{ marginTop: '40px' }}>Team logo (optional)</h4>
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
                  onChange={this.previewTeamLogo}
                />
                <p />
                <br />
                <br />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={this.state.disabled}
                >
                  Create new team
                </Button>
              </form>
            </Grid>
          </Grid>
          <br />
        </div>
      </Layout>
    );
  }

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { newName } = this.state;

    const { store } = this.props;

    if (!newName) {
      notify('Team name is required.');
      return;
    }

    const file = (document.getElementById('upload-file') as HTMLFormElement).files[0];

    try {
      this.setState({ disabled: true });

      const defaultAvatarUrl = 'https://storage.googleapis.com/async-await/default-user.png?v=1';
      const team = await store.addTeam({
        name: newName,
        avatarUrl: defaultAvatarUrl,
      });

      console.log(`Returned to client: ${team._id}, ${team.name}, ${team.slug}`);

      if (file == null) {
        Router.push(`/teams/${team.slug}/team-settings`);
        notify('You successfully created Team.<p />Redirecting...');
        return;
      }

      const fileName = file.name;
      const fileType = file.type;
      const bucket = process.env.BUCKET_FOR_TEAM_LOGOS;
      const prefix = team.slug;

      const responseFromApiServerForUpload = await getSignedRequestForUploadApiMethod({
        fileName,
        fileType,
        prefix,
        bucket,
      });

      const resizedFile = await resizeImage(file, 128, 128);

      await uploadFileUsingSignedPutRequestApiMethod(
        resizedFile,
        responseFromApiServerForUpload.signedRequest,
        {
          'Cache-Control': 'max-age=2592000',
        },
      );

      const uploadedAvatarUrl = responseFromApiServerForUpload.url;

      await team.updateTheme({ name: team.name, avatarUrl: uploadedAvatarUrl });

      this.setState({
        newName: '',
        newAvatarUrl: 'https://storage.googleapis.com/async-await/default-user.png?v=1',
      });

      (document.getElementById('upload-file') as HTMLFormElement).value = '';

      Router.push(`/teams/${team.slug}/team-settings`);

      notify('You successfully created Team. Redirecting ...');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  private previewTeamLogo = () => {
    const file = (document.getElementById('upload-file') as HTMLFormElement).files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (e) => {
      this.setState({ newAvatarUrl: e.target.result as string });
    };
  };
}

export default withAuth(inject('store')(observer(CreateTeam)));
