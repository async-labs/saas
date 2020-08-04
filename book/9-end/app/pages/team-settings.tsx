import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import TextField from '@material-ui/core/TextField';
import { inject, observer } from 'mobx-react';
import Head from 'next/head';
import NProgress from 'nprogress';
import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Layout from '../components/layout';
import InviteMember from '../components/teams/InviteMember';
import { getSignedRequestForUploadApiMethod, uploadFileUsingSignedPutRequestApiMethod } from '../lib/api/team-member';
import confirm from '../lib/confirm';
import notify from '../lib/notify';
import { resizeImage } from '../lib/resizeImage';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

type Props = { isMobile: boolean; store: Store; teamSlug: string };

type State = {
  newName: string;
  newAvatarUrl: string;
  disabled: boolean;
  inviteMemberOpen: boolean;
};

class TeamSettings extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      newName: this.props.store.currentTeam.name,
      newAvatarUrl: this.props.store.currentTeam.avatarUrl,
      disabled: false,
      inviteMemberOpen: false,
    };
  }

  public render() {
    const { store, isMobile } = this.props;
    const { currentTeam, currentUser } = store;
    const { newName, newAvatarUrl } = this.state;
    const isTeamLeader = currentTeam && currentUser && currentUser._id === currentTeam.teamLeaderId;

    // console.log(this.props.firstGridItem);

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
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
        <Layout {...this.props}>
          <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
            <p>Only the Team Leader can access this page.</p>
            <p>Create your own team to become a Team Leader.</p>
          </div>
        </Layout>
      );
    }

    return (
      <Layout {...this.props}>
        <Head>
          <title>Team Settings</title>
        </Head>
        <div style={{ padding: isMobile ? '0px' : '0px 30px', fontSize: '15px', height: '100%' }}>
              <h3>Team Settings</h3>
              <p />
              <br />
              <form onSubmit={this.onSubmit}>
                <h4>Team name</h4>
                <TextField
                  value={newName}
                  helperText="Team name as seen by your team members"
                  onChange={(event) => {
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
                <Button
                  variant="outlined"
                  color="primary"
                  component="span"
                  disabled={this.state.disabled}
                >
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
              <p />
              <br />
              <br />
              <h4 style={{ marginRight: 20, display: 'inline' }}>
                Team Members ( {Array.from(currentTeam.members.values()).length} / 20 )
              </h4>
              <Button
                onClick={this.openInviteMember}
                variant="outlined"
                color="primary"
                style={{ float: 'right', marginTop: '-20px' }}
                disabled={this.state.disabled}
              >
                Invite member
              </Button>
              <p />
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Person</TableCell>
                      <TableCell>Role</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {currentTeam.memberIds.map(userId => currentTeam.members.get(userId)).map((m) => (
                      <TableRow key={m._id}>
                        <TableCell style={{ width: '300px' }}>
                          <Hidden smDown>
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
                          <i
                            color="action"
                            data-id={m._id}
                            onClick={this.removeMember}
                            style={{
                              marginLeft: '20px',
                              fontSize: '16px',
                              opacity: 0.6,
                              cursor: 'pointer',
                              verticalAlign: 'middle',
                            }}
                            className="material-icons"
                          >
                            delete
                          </i>
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
                  <h4>
                    Invited users
                  </h4>
                  <p />
                  <TableContainer component={Paper}>
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
              <InviteMember
                open={this.state.inviteMemberOpen}
                onClose={this.handleInviteMemberClose}
                store={this.props.store}
              />
          <br />
        </div>
      </Layout>
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

    NProgress.start();

    try {
      this.setState({ disabled: true });

      await currentTeam.updateTheme({ name: newName, avatarUrl: newAvatarUrl });

      notify('You successfully updated Team name.');
    } catch (error) {
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

  private uploadFile = async () => {
    const { store } = this.props;
    const { currentTeam } = store;

    const fileElement = document.getElementById('upload-file') as HTMLFormElement;
    const file = fileElement.files[0];

    if (file == null) {
      notify('No file selected for upload.');
      return;
    }

    const fileName = file.name;
    const fileType = file.type;

    NProgress.start();
    this.setState({ disabled: true });

    const bucket = process.env.BUCKET_FOR_TEAM_LOGOS;
    const prefix = `${currentTeam.slug}`

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

      this.setState({
        newAvatarUrl: responseFromApiServerForUpload.url,
      });

      await currentTeam.updateTheme({
        name: this.state.newName,
        avatarUrl: this.state.newAvatarUrl,
      });

      notify('You successfully uploaded new Team logo.');
    } catch (error) {
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

  private openInviteMember = async () => {
    const { currentTeam } = this.props.store;
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

    this.setState({ inviteMemberOpen: true });
  };

  private handleInviteMemberClose = () => {
    this.setState({ inviteMemberOpen: false });
  };

  private removeMember = (event) => {
    const { currentTeam } = this.props.store;
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
}

export default withAuth(inject('store')(observer(TeamSettings)));
