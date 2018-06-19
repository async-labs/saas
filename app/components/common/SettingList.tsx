import React from 'react';
import { observer, inject } from 'mobx-react';
import Avatar from '@material-ui/core/Avatar';

import ActiveLink from '../common/ActiveLink';
import { Store } from '../../lib/store';

const styleTeamAvatar = {
  margin: '0px auto',
};

const styleLoadingDiv = {
  padding: '20px',
};

type MyProps = { store: Store; isTL: boolean };

@inject('store')
@observer
class SettingList extends React.Component<MyProps> {
  state = {
    addPublicTopicOpen: false,
  };

  render() {
    const { store, isTL } = this.props;
    const { currentTeam, currentUser } = store;

    if (!currentTeam) {
      return <div style={styleLoadingDiv}>Create new team or select existing team.</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div style={styleLoadingDiv}>loading Topics ...</div>;
    }

    return (
      <div>
        {isTL ? (
          <div>
            <h3>Team Settings</h3>
            <Avatar style={styleTeamAvatar} src={currentTeam.avatarUrl} />
            <p style={{ textAlign: 'center' }}>{currentTeam.name}</p>
            <hr style={{ width: '75%', margin: '0px auto' }} />
          </div>
        ) : null}
        {isTL ? (
          <div>
            <p />
            <p />
            <ActiveLink
              linkText="Team Members"
              href={`/settings/team-members?teamSlug=${currentTeam.slug}`}
              as={`/team/${currentTeam.slug}/settings/team-members`}
              highlighterSlug={'/team-members'}
            />
            <p />
            <ActiveLink
              linkText="Team Billing"
              href={`/settings/team-billing?teamSlug=${currentTeam.slug}`}
              as={`/team/${currentTeam.slug}/settings/team-billing`}
              highlighterSlug={'/team-billing'}
            />
            <p />
            <ActiveLink
              linkText="Team Profile"
              href={`/settings/team-profile?teamSlug=${currentTeam.slug}`}
              as={`/team/${currentTeam.slug}/settings/team-profile`}
              highlighterSlug={'/team-settings'}
            />
            <p />
            <hr style={{ width: '100%', margin: '20px auto' }} />
          </div>
        ) : null}

        <h3>Profile settings</h3>
        <Avatar style={styleTeamAvatar} src={currentUser.avatarUrl} />
        <p style={{ textAlign: 'center' }}>{currentUser.displayName}</p>
        <hr style={{ width: '75%', margin: '0px auto' }} />

        <p />
        <p />
        <ActiveLink
          linkText="Your Profile"
          href={`/settings/your-profile`}
          highlighterSlug={'/your-profile'}
        />
      </div>
    );
  }
}

export default SettingList;
