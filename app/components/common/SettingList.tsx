import React from 'react';
import { observer, inject } from 'mobx-react';
import Avatar from '@material-ui/core/Avatar';

import ActiveLink from './ActiveLink';
import { Store } from '../../lib/store';

const styleTeamAvatar = {
  margin: '0px auto',
};

const styleNotFoundDiv = {
  padding: '20px',
};

type MyProps = { store: Store; isTL: boolean };

class SettingList extends React.Component<MyProps> {
  render() {
    const { store, isTL } = this.props;
    const { currentTeam, currentUser } = store;

    if (!currentTeam) {
      return (
        <div style={styleNotFoundDiv}>
          No Team is found. Create new Team or select existing Team.
        </div>
      );
    }

    return (
      <React.Fragment>
        {isTL ? (
          <div>
            <h3>Team Settings</h3>
            <Avatar style={styleTeamAvatar} src={currentTeam.avatarUrl} />
            <p style={{ textAlign: 'center' }}>{currentTeam.name}</p>
            <hr style={{ width: '75%', margin: '-10px auto 20px auto' }} />
          </div>
        ) : null}
        {isTL ? (
          <div>
            <p />
            <p />
            <ActiveLink
              hasIcon
              linkText="Team Members"
              href={`/settings/team-members?teamSlug=${currentTeam.slug}`}
              as={`/team/${currentTeam.slug}/settings/team-members`}
              highlighterSlug={'/team-members'}
            />
            <p />
            <ActiveLink
              hasIcon
              linkText="Team Billing"
              href={`/settings/team-billing?teamSlug=${currentTeam.slug}`}
              as={`/team/${currentTeam.slug}/settings/team-billing`}
              highlighterSlug={'/team-billing'}
            />
            <p />
            <ActiveLink
              hasIcon
              linkText="Team Profile"
              href={`/settings/team-profile?teamSlug=${currentTeam.slug}`}
              as={`/team/${currentTeam.slug}/settings/team-profile`}
              highlighterSlug={'/team-profile'}
            />
            <p />
          </div>
        ) : null}

        <hr style={{ width: '100%', margin: '20px auto' }} />

        <h3>Profile settings</h3>
        <Avatar style={styleTeamAvatar} src={currentUser.avatarUrl} />
        <p style={{ textAlign: 'center' }}>{currentUser.displayName}</p>
        <hr style={{ width: '75%', margin: '-10px auto 20px auto' }} />

        <p />
        <p />
        <ActiveLink
          hasIcon
          linkText="Your Profile"
          href={`/settings/your-profile`}
          highlighterSlug={'/your-profile'}
        />
      </React.Fragment>
    );
  }
}

export default inject('store')(observer(SettingList));
