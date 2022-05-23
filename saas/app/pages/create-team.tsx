import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
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

type Props = { store: Store; isMobile: boolean; firstGridItem: boolean; teamRequired: boolean };

function CreateTeam({ store, isMobile, firstGridItem, teamRequired }: Props) {
  const [newName, setNewName] = useState<string>('');
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>(
    'https://storage.googleapis.com/async-await/default-user.png?v=1',
  );
  const [disabled, setDisabled] = useState<boolean>(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newName) {
      notify('Team name is required.');
      return;
    }

    const file = (document.getElementById('upload-file') as HTMLFormElement).files[0];

    try {
      setDisabled(true);

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
      const bucket = process.env.NEXT_PUBLIC_BUCKET_FOR_TEAM_LOGOS;
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

      setNewName('');
      setNewAvatarUrl('https://storage.googleapis.com/async-await/default-user.png?v=1');

      (document.getElementById('upload-file') as HTMLFormElement).value = '';

      Router.push(`/teams/${team.slug}/team-settings`);

      notify('You successfully created Team. Redirecting ...');
    } catch (error) {
      console.log(error);
      notify(error);
    } finally {
      setDisabled(false);
    }
  };

  const previewTeamLogo = () => {
    const file = (document.getElementById('upload-file') as HTMLFormElement).files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (e) => {
      setNewAvatarUrl(e.target.result as string);
    };
  };

  return (
    <Layout
      store={store}
      isMobile={isMobile}
      teamRequired={teamRequired}
      firstGridItem={firstGridItem}
    >
      <Head>
        <title>Create Team</title>
        <meta name="description" content="Create a new Team at SaaS Boilerplate" />
      </Head>
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Grid container style={styleGrid}>
          <Grid item sm={12} xs={12} style={{ padding: isMobile ? '0px' : '0px 30px' }}>
            <h3>Create team</h3>
            <p />
            <form onSubmit={onSubmit}>
              <h4>Team name</h4>
              <TextField
                value={newName}
                label="Type your team's name."
                helperText="Team name as seen by your team members."
                onChange={(event) => {
                  setNewName(event.target.value);
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
                onChange={previewTeamLogo}
              />
              <p />
              <br />
              <br />
              <Button variant="contained" color="primary" type="submit" disabled={disabled}>
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

export default withAuth(inject('store')(observer(CreateTeam)));
