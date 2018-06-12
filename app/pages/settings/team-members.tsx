import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Head from 'next/head';
import {
  Grid,
  Button,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@material-ui/core';

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

type MyProps = { teamSlug: string; store: Store };
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
      notify('Team have not selected');
      return;
    }

    this.setState({ inviteMemberOpen: true });
  };

  removeMember = event => {
    const { currentTeam } = this.props.store;
    if (!currentTeam) {
      notify('Team have not selected');
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
    const { store } = this.props;
    const { currentTeam, currentUser } = store;
    const isTL = currentUser._id === currentTeam.teamLeaderId;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div>Team not selected</div>;
    }

    return (
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Team Members</title>
          <meta name="description" content="description" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={this.props.store} />
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
