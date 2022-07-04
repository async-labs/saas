import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Hidden from '@mui/material/Hidden';
import TextField from '@mui/material/TextField';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { inject, observer } from 'mobx-react';
import Head from 'next/head';
import NProgress from 'nprogress';

import * as React from 'react';
import { useState } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Layout from '../components/layout';
import InviteMember from '../components/teams/InviteMember';
import {
  getSignedRequestForUploadApiMethod,
  uploadFileUsingSignedPutRequestApiMethod,
} from '../lib/api/team-member';
import confirm from '../lib/confirm';
import notify from '../lib/notify';
import { resizeImage } from '../lib/resizeImage';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

type Props = {
  store: Store;
  isMobile: boolean;
  firstGridItem: boolean;
  teamRequired: boolean;
  teamSlug: string;
};

function TeamSettings({ store, isMobile, firstGridItem, teamRequired, teamSlug }: Props) {
  const [newName, setNewName] = useState<string>(store.currentTeam.name);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>(store.currentTeam.avatarUrl);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState<boolean>(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { currentTeam } = store;

    if (!newName) {
      notify('Team name is required');
      return;
    }

    NProgress.start();
    setDisabled(true);

    try {
      await currentTeam.updateTheme({ name: newName, avatarUrl: newAvatarUrl });

      notify('You successfully updated Team name.');
    } catch (error) {
      notify(error);
    } finally {
      setDisabled(false);
      NProgress.done();
    }
  };

  const uploadFile = async () => {
    const { currentTeam } = store;

    const fileElement = document.getElementById('upload-file-team-logo') as HTMLFormElement;
    const file = fileElement.files[0];

    if (file == null) {
      notify('No file selected for upload.');
      return;
    }

    const fileName = file.name;
    const fileType = file.type;

    NProgress.start();
    setDisabled(true);

    const bucket = process.env.NEXT_PUBLIC_BUCKET_FOR_TEAM_LOGOS;
    const prefix = `${currentTeam.slug}`;

    console.log(bucket);

    try {
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
        { 'Cache-Control': 'max-age=2592000' },
      );

      setNewAvatarUrl(responseFromApiServerForUpload.url);

      await currentTeam.updateTheme({
        name: newName,
        avatarUrl: newAvatarUrl,
      });

      notify('You successfully uploaded new Team logo.');
    } catch (error) {
      notify(error);
    } finally {
      setDisabled(false);
      NProgress.done();
    }
  };

  const openInviteMember = async () => {
    const { currentTeam } = store;
    if (!currentTeam) {
      notify('You have not selected a Team.');
      return;
    }

    const ifTeamLeaderMustBeCustomer = await currentTeam.checkIfTeamLeaderMustBeCustomer();

    if (ifTeamLeaderMustBeCustomer) {
      notify(
        'To add a third team member, you have to become a paid customer.' +
          '<p />' +
          ' To become a paid customer,' +
          ' navigate to Billing page.',
      );
      return;
    }

    setInviteMemberOpen(true);
  };

  const handleInviteMemberClose = () => {
    setInviteMemberOpen(false);
  };

  const removeMember = (event) => {
    const { currentTeam } = store;

    if (!currentTeam) {
      notify('You have not selected a Team.');
      return;
    }

    const userId = event.currentTarget.dataset.id;
    if (!userId) {
      notify('Select user.');
      return;
    }

    confirm({
      title: 'Are you sure?',
      message: '',
      onAnswer: async (answer) => {
        if (answer) {
          try {
            await currentTeam.removeMember(userId);
          } catch (error) {
            notify(error);
          }
        }
      },
    });
  };

  const { currentTeam, currentUser } = store;
  const isTeamLeader = currentTeam && currentUser && currentUser._id === currentTeam.teamLeaderId;

  if (!currentTeam || currentTeam.slug !== teamSlug) {
    return (
      <Layout
        store={store}
        isMobile={isMobile}
        teamRequired={teamRequired}
        firstGridItem={firstGridItem}
      >
        <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
          <p>You did not select any team.</p>
          <p>
            To access this page, please select existing team or create new team if you have no
            teams.
          </p>
        </div>
      </Layout>
    );
  }

  if (!isTeamLeader) {
    return (
      <Layout
        store={store}
        isMobile={isMobile}
        teamRequired={teamRequired}
        firstGridItem={firstGridItem}
      >
        <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
          <p>Only the Team Leader can access this page.</p>
          <p>Create your own team to become a Team Leader.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      store={store}
      isMobile={isMobile}
      teamRequired={teamRequired}
      firstGridItem={firstGridItem}
    >
      <Head>
        <title>Team Settings</title>
      </Head>
      <div style={{ padding: isMobile ? '0px' : '0px 30px', fontSize: '15px', height: '100%' }}>
        <h3>Team Settings</h3>
        <p />
        <br />
        <form onSubmit={onSubmit}>
          <h4>Team name</h4>
          <TextField
            value={newName}
            helperText="Team name as seen by your team members"
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
        <label htmlFor="upload-file-team-logo">
          <Button variant="contained" color="primary" component="span" disabled={disabled}>
            Update logo
          </Button>
        </label>
        <input
          accept="image/*"
          name="upload-file-team-logo"
          id="upload-file-team-logo"
          type="file"
          style={{ display: 'none' }}
          onChange={uploadFile}
        />
        <p />
        <br />
        <br />
        <h4 style={{ marginRight: 20, display: 'inline' }}>
          Team Members ( {Array.from(currentTeam.members.values()).length} / 20 )
        </h4>
        <Button
          onClick={openInviteMember}
          variant="contained"
          color="primary"
          style={{ float: 'right', marginTop: '-20px' }}
          disabled={disabled}
        >
          Invite member
        </Button>
        <p />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Person</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentTeam.memberIds
                .map((userId) => currentTeam.members.get(userId))
                .map((m) => (
                  <TableRow key={m._id}>
                    <TableCell style={{ width: '300px' }}>
                      <Hidden mdDown>
                        <Avatar
                          role="presentation"
                          src={m.avatarUrl}
                          alt={(m.displayName || m.email)[0]}
                          key={m._id}
                          style={{
                            margin: '0px 5px',
                            display: 'inline-flex',
                            width: '30px',
                            height: '30px',
                            verticalAlign: 'middle',
                          }}
                        />
                      </Hidden>
                      {m.email}
                    </TableCell>
                    <TableCell>
                      {isTeamLeader && m._id !== currentUser._id ? 'Team Member' : 'Team Leader'}
                    </TableCell>
                    <TableCell>
                      {isTeamLeader && m._id !== currentUser._id ? (
                        <DeleteOutlineIcon
                          color="action"
                          data-id={m._id}
                          onClick={removeMember}
                          style={{
                            marginLeft: '20px',
                            fontSize: '16px',
                            opacity: 0.6,
                            cursor: 'pointer',
                            verticalAlign: 'middle',
                          }}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <p />
        <br />

        {Array.from(currentTeam.invitations.values()).length > 0 ? (
          <React.Fragment>
            <h4>Invited users</h4>
            <p />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {Array.from(currentTeam.invitations.values()).map((i) => (
                    <TableRow key={i._id}>
                      <TableCell style={{ width: '300px' }}>{i.email}</TableCell>
                      <TableCell>Sent</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </React.Fragment>
        ) : null}
        <p />
        <br />
        <InviteMember open={inviteMemberOpen} onClose={handleInviteMemberClose} store={store} />
        <br />
      </div>
    </Layout>
  );
}

export default withAuth(inject('store')(observer(TeamSettings)));
