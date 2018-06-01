import Head from 'next/head';
import Link from 'next/link';

import withLayout from '../lib/withLayout';
import withAuth from '../lib/withAuth';
import Button from '@material-ui/core/Button';
import { observer } from 'mobx-react';

const Index = ({ store }) => (
  <div style={{ padding: '0px 0px 0px 20px' }}>
    <Head>
      <title>Async</title>
      <meta name="description" content="description" />
    </Head>
    <h2>Teams</h2>
    <Link href="/settings/add-team">
      <Button variant="raised" color="primary">
        Add team
      </Button>
    </Link>
    <ul>
      {store.teams.map(t => (
        <li key={t._id}>
          <a>{t.name}</a>
        </li>
      ))}
    </ul>
  </div>
);

export default withAuth(withLayout(observer(Index)));
