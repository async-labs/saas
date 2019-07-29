import Button from '@material-ui/core/Button';
import Head from 'next/head';

import Layout from '../components/layout';

const Index = () => (
  <Layout firstGridItem={true} isMobile={false}>
    <Head>
      <title>Index page</title>
      <meta name="description" content="This is a description of the Index page" />
    </Head>
    <div style={{ padding: '0px 30px', fontSize: '15px', height: '100%', color: '#222' }}>
      <p>Content on Index page</p>
      <Button variant="contained">MUI button</Button>
    </div>
  </Layout>
);

export default Index;
