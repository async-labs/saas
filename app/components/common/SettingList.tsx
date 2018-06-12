import React from 'react';
import { observer, inject } from 'mobx-react';

import ActiveLink from '../common/ActiveLink';
import { Store } from '../../lib/store';

type MyProps = { store: Store };

@inject('store')
@observer
class SettingList extends React.Component<MyProps> {
  state = {
    addPublicTopicOpen: false,
  };

  render() {
    const { store } = this.props;
    const { currentTeam } = store;

    if (!currentTeam) {
      return <div>Team not selected</div>;
    }

    if (!currentTeam.isInitialTopicsLoaded) {
      return <div>loading...</div>;
    }

    return (
      <div>
        <p>Settings for:</p>
        <p style={{ textAlign: 'center', fontWeight: 600 }}>{currentTeam.name}</p>
        <p />
        <hr style={{ width: '85%', margin: '20px auto 10px auto' }} />
        <p />
        <ActiveLink
          linkText="Team Members"
          href={`/team/${currentTeam.slug}/settings/team-members`}
          as={`/team/${currentTeam.slug}/settings/team-members`}
          highlighterSlug={'/team-members'}
        />
        <p />
        <ActiveLink
          linkText="Team Billing"
          href={`/team/${currentTeam.slug}/settings/team-billing`}
          as={`/team/${currentTeam.slug}/settings/team-billing`}
          highlighterSlug={'/team-billing'}
        />
        <p />
        <ActiveLink
          linkText="Team Constraints"
          href={`/team/${currentTeam.slug}/settings/team-constraints`}
          as={`/team/${currentTeam.slug}/settings/team-constraints`}
          highlighterSlug={'/team-constraints'}
        />
        <p />
        <ActiveLink
          linkText="Team Settings"
          href={`/team/${currentTeam.slug}/settings/team-settings`}
          as={`/team/${currentTeam.slug}/settings/team-settings`}
          highlighterSlug={'/team-settings'}
        />
        <p />
        <hr style={{ width: '85%', margin: '20px auto 10px auto' }} />
        <p />
        <ActiveLink
          linkText="Create team"
          href={`/settings/create-team`}
          as={`/settings/create-team`}
          highlighterSlug={'/create-team'}
        />
        <p />
        <hr style={{ width: '85%', margin: '20px auto 10px auto' }} />
        <p />
        <ActiveLink
          linkText="Your Profile"
          href={`/settings/your-profile`}
          as={`/settings/your-profile`}
          highlighterSlug={'/your-profile'}
        />
      </div>
    );
  }
}

export default SettingList;
