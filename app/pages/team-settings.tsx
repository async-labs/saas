import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';
import Head from 'next/head';
import * as React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import MenuWithMenuItems from '../components/common/MenuWithMenuItems';
import Layout from '../components/layout';
import InviteMember from '../components/teams/InviteMember';
import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../lib/api/team-member';
import confirm from '../lib/confirm';
import notify from '../lib/notifier';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

import env from '../lib/env';

const styleGrid = {
  height: '100%',
};

// const styleGridItem = {
//   padding: '0px 20px',
//   borderRight: '0.5px #aaa solid',
// };

const styleTableCell = {
  padding: '15px 56px 15px 15px',
};

const getMenuOptions = member => ({
  dataId: member._id,
  id: `post-menu-${member._id}`,
  tooltipTitle: 'Manage member',
});

const getMenuItemOptions = (member, component) => [
  {
    text: 'Remove member',
    dataId: member._id,
    onClick: component.removeMember,
  },
];

type MyProps = { teamSlug: string; store: Store; isTL: boolean; isMobile: boolean; };
type MyState = { inviteMemberOpen: boolean; newName: string; newAvatarUrl: string; disabled: boolean };

class TeamSettings extends React.Component<MyProps, MyState> {
  constructor(props) {
    super(props);

    this.state = {
      newName: this.props.store.currentTeam.name,
      newAvatarUrl: this.props.store.currentTeam.avatarUrl,
      disabled: false,
      inviteMemberOpen: false,
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

  public handleInviteMemberClose = () => {
    this.setState({ inviteMemberOpen: false });
  };

  public inviteMember = () => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('You have not selected a Team.');
      return;
    }

    this.setState({ inviteMemberOpen: true });
  };

  public removeMember = event => {
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
      onAnswer: async answer => {
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

  public renderMenu(member) {
    return (
      <div>
        <MenuWithMenuItems
          menuOptions={getMenuOptions(member)}
          itemOptions={getMenuItemOptions(member, this)}
        />
      </div>
    );
  }

  // TODO: MobX for when new user is invited
  // TODO: MobX when member gets removed

  public render() {
    const { store, isMobile } = this.props;
    const { currentTeam, currentUser } = store;
    const { newName, newAvatarUrl } = this.state;
    const isTL = currentTeam && currentUser && currentUser._id === currentTeam.teamLeaderId;

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

    if (!isTL) {
      return (
        <Layout {...this.props}>
          <Head>
            <title>Team Settings</title>
            <meta name="description" content="Only the Team Leader can access this page" />
          </Head>
          <div style={{ padding: isMobile ? '0px' : '0px 30px', fontSize: '14px', height: '100%' }}>
            <Grid container style={styleGrid}>
              <Grid item sm={12} xs={12} style={{ padding: '0px 20px' }}>
                <h3>Team Settings</h3>
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
          <title>Team Settings</title>
          <meta name="description" content={`Add or edit members for Team ${currentTeam.name}`} />
        </Head>
        <div style={{ padding: isMobile ? '0px' : '0px 30px', fontSize: '15px', height: '100%' }}>
          <Grid container style={styleGrid}>
            <Grid item sm={12} xs={12} style={{ padding: '0px 20px' }}>
              <h3>Team Settings</h3>
              <p />
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
                onClick={this.inviteMember}
                variant="outlined"
                color="primary"
                style={{ verticalAlign: 'middle', float: 'right' }}
              >
                Invite member
              </Button>
              <p />
              <br />
              <Paper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={styleTableCell}>Person</TableCell>
                      <TableCell style={styleTableCell}>Role</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {Array.from(currentTeam.members.values()).map(m => (
                      <TableRow key={m._id}>
                        <TableCell style={styleTableCell} component="th" scope="row">
                          <Hidden smDown>
                            <Avatar
                              role="presentation"
                              src={m.avatarUrl}
                              alt={m.avatarUrl}
                              key={m._id}
                              style={{
                                margin: '0px 5px',
                                display: 'inline-flex',
                                width: '30px',
                                height: '30px',
                                verticalAlign: 'middle',
                              }}
                            />{' '}
                          </Hidden>
                          {m.displayName}
                        </TableCell>
                        <TableCell style={styleTableCell}>
                          {isTL && m._id !== currentUser._id ? (
                            <div style={{ display: 'inline-flex' }}>
                              <div style={{ paddingRight: 10 }}>Team Member</div>{' '}
                              {this.renderMenu(m)}
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex' }}>
                              <div style={{ paddingRight: 10 }}>Team Leader</div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <br />

              {Array.from(currentTeam.invitedUsers.values()).length > 0 ? (
                <div>
                  <h4>
                    Invited users ( {Array.from(currentTeam.invitedUsers.values()).length} /{' '}
                    {20 - Array.from(currentTeam.members.values()).length} )
                  </h4>
                  <Paper>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell style={styleTableCell}>Email</TableCell>
                          <TableCell style={styleTableCell}>Status</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {Array.from(currentTeam.invitedUsers.values()).map(i => (
                          <TableRow key={i._id}>
                            <TableCell style={styleTableCell} component="th" scope="row">
                              {i.email}{' '}
                            </TableCell>
                            <TableCell style={styleTableCell}>Sent</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </div>
              ) : null}
              <br />
              <br />
              <p />
            </Grid>

            <InviteMember
              open={this.state.inviteMemberOpen}
              onClose={this.handleInviteMemberClose}
              store={this.props.store}
            />
          </Grid>
          <br />
        </div>
      </Layout>
    );
  }
}

export default withAuth(observer(TeamSettings));
