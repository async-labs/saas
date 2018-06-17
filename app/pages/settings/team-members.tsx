import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Head from 'next/head';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';

import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';
import notify from '../../lib/notifier';
import confirm from '../../lib/confirm';
import SettingList from '../../components/common/SettingList';
import MenuWithMenuItems from '../../components/common/MenuWithMenuItems';
import InviteMember from '../../components/teams/InviteMember';

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #aaa solid',
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

@inject('store')
@observer
class TeamMembers extends React.Component<MyProps, MyState> {
  state = {
    inviteMemberOpen: false,
  };

  handleInviteMemberClose = () => {
    this.setState({ inviteMemberOpen: false });
  };

  inviteMember = () => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('You have not selected a Team.');
      return;
    }

    this.setState({ inviteMemberOpen: true });
  };

  removeMember = event => {
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

  renderMenu(member) {
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
  // TODO: MobX when invited user becomes team member
  // TODO: MobX when member gets removed - already done

  render() {
    const { store, isTL } = this.props;
    const { currentTeam, currentUser } = store;

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
            <title>Team Members</title>
            <meta name="description" content="Only the Team Leader can access this page" />
          </Head>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTL={isTL} />
            </Grid>
            <Grid item sm={10} xs={12} style={styleGridItem}>
              <h3>Team Members</h3>
              <p>Only the Team Leader can access this page.</p>
              <p>Create your own team to become a Team Leader.</p>
            </Grid>
          </Grid>
        </div>
      );
    }

    return (
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Team Members</title>
          <meta name="description" content={`Add or edit members for Team ${currentTeam.name}`} />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={store} isTL={isTL} />
          </Grid>
          <Grid item sm={10} xs={12} style={styleGridItem}>
            <h3>Team Members</h3>
            <br />
            <h4 style={{ marginRight: 20, display: 'inline' }}>
              Current Team ( {Array.from(currentTeam.members.values()).length} / 20 )
            </h4>
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
                    <TableCell>Team member</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {Array.from(currentTeam.members.values()).map(m => (
                    <TableRow key={m._id}>
                      <TableCell component="th" scope="row">
                        {m.displayName}{' '}
                      </TableCell>
                      <TableCell>
                        {isTL && m._id !== currentUser._id ? (
                          <div style={{ display: 'inline-flex' }}>
                            <div style={{ paddingRight: 10 }}>Team Member</div> {this.renderMenu(m)}
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
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {Array.from(currentTeam.invitedUsers.values()).map(i => (
                        <TableRow key={i._id}>
                          <TableCell component="th" scope="row">
                            {i.email}{' '}
                          </TableCell>
                          <TableCell>Email sent</TableCell>
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

          <InviteMember open={this.state.inviteMemberOpen} onClose={this.handleInviteMemberClose} />
        </Grid>
      </div>
    );
  }
}

export default withAuth(withLayout(TeamMembers));
