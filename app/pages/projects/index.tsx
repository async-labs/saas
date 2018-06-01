import React from 'react';
import { observer } from 'mobx-react';


import withLayout from '../../lib/withLayout';
import withAuth from '../../lib/withAuth';
import { Store } from '../../lib/store';


const dev = process.env.NODE_ENV !== 'production';
const LOG_OUT_URL = dev ? 'http://localhost:8000' : 'https://api1.async-await.com';

@observer
class Projects extends React.Component<{ teamSlug: string; store: Store }> {
  state = {
    inviteMemberOpen: false,
  };

  static async getInitialProps({ query }) {
    const { teamSlug } = query;

    return { teamSlug };
  }

  componentDidMount() {
    this.checkTeam();
  }

  componentDidUpdate() {
    this.checkTeam();
  }

  checkTeam() {
    const { teamSlug, store } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== teamSlug) {
      store.setCurrentTeam(teamSlug);
    }
  }

  render() {
    const { currentTeam } = this.props.store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return <div>Team not selected</div>;
    }

    return (
      <div style={{ padding: '0px 0px 0px 20px' }}>
        <h2>Projects for</h2>
        <h2>"{currentTeam.name}" Team</h2>

        <p>TODO: </p>

      </div>
    );
  }
}

export default withAuth(withLayout(Projects));
