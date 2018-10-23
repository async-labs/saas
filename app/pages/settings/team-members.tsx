import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import { observer } from 'mobx-react';
import Head from 'next/head';
import * as React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import MenuWithMenuItems from '../../components/common/MenuWithMenuItems';
import SettingList from '../../components/common/SettingList';
import Layout from '../../components/layout';
import InviteMember from '../../components/teams/InviteMember';
import confirm from '../../lib/confirm';
import notify from '../../lib/notifier';
import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
};

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

type MyProps = { teamSlug: string; store: Store; isTL: boolean };
type MyState = { inviteMemberOpen: boolean };

class TeamMembers extends React.Component<MyProps, MyState> {
  public state = {
    inviteMemberOpen: false,
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
    const { store } = this.props;
    const { currentTeam, currentUser } = store;
    const isTL = currentTeam && currentUser && currentUser._id === currentTeam.teamLeaderId;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
          <div style={{ padding: '20px' }}>
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
            <title>Team Members</title>
            <meta name="description" content="Only the Team Leader can access this page" />
          </Head>
          <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
            <Grid container style={styleGrid}>
              <Grid item sm={2} xs={12} style={styleGridItem}>
                <SettingList store={store} isTeamSettings={true} />
              </Grid>
              <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
                <h3>Team Members</h3>
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
          <title>Team Members</title>
          <meta name="description" content={`Add or edit members for Team ${currentTeam.name}`} />
        </Head>
        <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTeamSettings={true} />
            </Grid>
            <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
              <h3>Team Members</h3>
              <p />
              <h4 style={{ marginRight: 20, display: 'inline' }}>
                Current Team ( {Array.from(currentTeam.members.values()).length} / 20 )
              </h4>
              <p />
              <Button
                onClick={this.inviteMember}
                variant="outlined"
                color="primary"
                style={{ verticalAlign: 'baseline' }}
              >
                Invite member
              </Button>
              <p />
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

export default withAuth(observer(TeamMembers));
