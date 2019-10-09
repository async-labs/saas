import Head from 'next/head';

const Index = () => (
  <div>
    <Head>
      <title>Index page</title>
      <meta name="description" content="This is a description of the Index page" />
    </Head>
    <div style={{ padding: '0px 30px', fontSize: '15px', height: '100%', color: '#222' }}>
      <p>Content on Index page</p>
    </div>
  </div>
);

export default Index;
