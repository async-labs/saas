import React from 'react';
import Head from 'next/head';

import Link from 'next/link';

import Layout from '../components/layout';

const Index = () => (
  <Layout firstGridItem={true}>
    <Head>
      <title>Index page</title>
      <meta name="description" content="This is a description of the Index page" />
    </Head>
    <div style={{ padding: '0px 30px', fontSize: '15px', height: '100%' }}>
      <p>Content on Index page</p>
      <Link href="/csr-page" as="/csr-page">
        <a>Go to CSR page</a>
      </Link>
      <p />
      <i className="material-icons">menu</i>
    </div>
  </Layout>
);

export default Index;

// import Button from '@material-ui/core/Button';
// import Head from 'next/head';
// import * as React from 'react';
// import NProgress from 'nprogress';

// import confirm from '../lib/confirm';
// import notify from '../lib/notify';

// import Layout from '../components/layout';

// class Index extends React.Component<{ isMobile: boolean }> {
//   public render() {
//     return (
//       <Layout firstGridItem={true} isMobile={this.props.isMobile}>
//         <Head>
//           <title>Index page</title>
//           <meta name="description" content="This is a description of the Index page" />
//         </Head>
//         <div style={{ padding: '0px 30px', fontSize: '15px', height: '100%', color: '#222' }}>
//           <p>Content on Index page</p>
//           <Button variant="contained" onClick={() => notify('some text')}>
//             MUI button Notify
//           </Button>
//           <p />
//           <Button
//             variant="contained"
//             onClick={() =>
//               confirm({
//                 title: 'Are you sure?',
//                 message: 'explanatory message',
//                 onAnswer: async (answer) => {
//                   if (!answer) {
//                     return;
//                   }

//                   NProgress.start();

//                   try {
//                     notify('You successfully confirmed.');
//                   } catch (error) {
//                     console.error(error);
//                     notify(error);
//                   } finally {
//                     NProgress.done();
//                   }
//                 },
//               })
//             }
//           >
//             MUI button Confirm
//           </Button>
//         </div>
//       </Layout>
//     );
//   }
// }

// export default Index;
