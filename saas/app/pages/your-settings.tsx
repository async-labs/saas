import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DoneIcon from '@mui/icons-material/Done';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { inject, observer } from 'mobx-react';
import Head from 'next/head';
import Link from 'next/link';
import NProgress from 'nprogress';

import * as React from 'react';
import { useState } from 'react';

import Layout from '../components/layout';

import {
  getSignedRequestForUploadApiMethod,
  uploadFileUsingSignedPutRequestApiMethod,
} from '../lib/api/team-member';

import notify from '../lib/notify';
import { resizeImage } from '../lib/resizeImage';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

const dev = process.env.NODE_ENV !== 'production';
const URL_APP = dev ? process.env.NEXT_PUBLIC_URL_APP : process.env.NEXT_PUBLIC_PRODUCTION_URL_APP;

type Props = {
  store: Store;
  isMobile: boolean;
  firstGridItem: boolean;
  teamRequired: boolean;
};

function YourSettings({ store, isMobile, firstGridItem, teamRequired }: Props) {
  const [newName, setNewName] = useState<string>(store.currentUser.displayName);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>(store.currentUser.avatarUrl);
  const [disabled, setDisabled] = useState<boolean>(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { currentUser } = store;

    if (!newName) {
      notify('Name is required');
      return;
    }

    NProgress.start();
    setDisabled(true);

    try {
      await currentUser.updateProfile({ name: newName, avatarUrl: newAvatarUrl });

      notify('You successfully updated your profile.');
    } catch (error) {
      notify(error);
    } finally {
      setDisabled(false);
      NProgress.done();
    }
  };

  const uploadFile = async () => {
    const fileElement = document.getElementById('upload-file-user-avatar') as HTMLFormElement;
    const file = fileElement.files[0];

    const { currentUser } = store;

    if (file == null) {
      notify('No file selected for upload.');
      return;
    }

    const fileName = file.name;
    const fileType = file.type;

    NProgress.start();
    setDisabled(true);

    const bucket = process.env.NEXT_PUBLIC_BUCKET_FOR_AVATARS;

    const prefix = `${currentUser.slug}`;

    try {
      const responseFromApiServerForUpload = await getSignedRequestForUploadApiMethod({
        fileName,
        fileType,
        prefix,
        bucket,
      });

      const resizedFile = await resizeImage(file, 128, 128);

      // console.log(file);
      // console.log(resizedFile);

      await uploadFileUsingSignedPutRequestApiMethod(
        resizedFile,
        responseFromApiServerForUpload.signedRequest,
        { 'Cache-Control': 'max-age=2592000' },
      );

      setNewAvatarUrl(responseFromApiServerForUpload.url);

      await currentUser.updateProfile({
        name: newName,
        avatarUrl: newAvatarUrl,
      });

      notify('You successfully uploaded new avatar.');
    } catch (error) {
      notify(error);
    } finally {
      fileElement.value = '';
      setDisabled(false);
      NProgress.done();
    }
  };

  const { currentUser } = store;

  return (
    <Layout
      store={store}
      isMobile={isMobile}
      teamRequired={teamRequired}
      firstGridItem={firstGridItem}
    >
      <Head>
        <title>Your Settings at Async</title>
      </Head>
      <div
        style={{
          padding: isMobile ? '0px' : '0px 30px',
          fontSize: '15px',
          height: '100%',
        }}
      >
        <h3>Your Settings</h3>
        <h4 style={{ marginTop: '40px' }}>Your account</h4>
        <div>
          <DoneIcon color="action" style={{ verticalAlign: 'text-bottom' }} />{' '}
          {currentUser.isSignedupViaGoogle
            ? 'You signed up on Async using your Google account.'
            : 'You signed up on Async using your email.'}
          <p />
          <li>
            Your email: <b>{currentUser.email}</b>
          </li>
          <li>
            Your username: <b>{currentUser.displayName}</b>
          </li>
        </div>
        <form onSubmit={onSubmit} autoComplete="off">
          <h4>Your username</h4>
          <TextField
            autoComplete="off"
            value={newName}
            helperText="Your username as seen by your team members"
            onChange={(event) => {
              setNewName(event.target.value);
            }}
          />
          <br />
          <br />
          <Button variant="contained" color="primary" type="submit" disabled={disabled}>
            Update username
          </Button>
        </form>

        <br />
        <h4>Your photo</h4>
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
        <label htmlFor="upload-file-user-avatar">
          <Button variant="outlined" color="primary" component="span" disabled={disabled}>
            Update avatar
          </Button>
        </label>
        <input
          accept="image/*"
          name="upload-file-user-avatar"
          id="upload-file-user-avatar"
          type="file"
          style={{ display: 'none' }}
          onChange={uploadFile}
        />
        <p />
        <br />
        <h4 style={{ marginRight: 20, display: 'inline' }}>Your Teams</h4>
        <Link href={`${URL_APP}/create-team`}>
          <Button
            variant="contained"
            color="primary"
            style={{
              fontSize: isMobile ? '13px' : '14px',
              marginTop: isMobile ? '10px' : '-20px',
              float: 'right',
            }}
          >
            + Add team
          </Button>
        </Link>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team name</TableCell>
                <TableCell>Team slug</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {store.teams.map((t) => (
                <TableRow key={t._id}>
                  <TableCell style={{ width: '300px' }}>{t.name}</TableCell>
                  <TableCell>{t.slug}</TableCell>
                  <TableCell>
                    <Link href={`${URL_APP}/teams/${t.slug}/discussions`}>
                      <Button
                        variant="contained"
                        color="primary"
                        style={{
                          fontSize: isMobile ? '13px' : '14px',
                          marginTop: isMobile ? '10px' : 'inherit',
                        }}
                      >
                        See team
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Layout>
  );
}

export default withAuth(inject('store')(observer(YourSettings)));
