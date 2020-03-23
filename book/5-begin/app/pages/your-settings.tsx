// import Avatar from '@material-ui/core/Avatar';
// import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';
// import Head from 'next/head';
// import NProgress from 'nprogress';
// import * as React from 'react';

// import Layout from '../components/layout';

// import { getUserBySlugApiMethod } from '../lib/api/public';

// import { getSignedRequestForUpload, uploadFileUsingSignedPutRequest } from '../lib/api/team-member';

// import notify from '../lib/notify';
// import { resizeImage } from '../lib/resizeImage';

// type MyProps = {
//   isMobile: boolean;
//   user: { email: string; displayName: string; slug: string; avatarUrl: string };
// };

// type MyState = { newName: string; newAvatarUrl: string; disabled: boolean };

// class YourSettings extends React.Component<MyProps, MyState> {
//   public static async getInitialProps() {
//     const slug = 'team-builder-book';

//     const user = await getUserBySlugApiMethod(slug);

//     console.log(user);

//     return { ...user };
//   }

//   constructor(props) {
//     super(props);

//     this.state = {
//       newName: this.props.user.displayName,
//       newAvatarUrl: this.props.user.avatarUrl,
//       disabled: false,
//     };
//   }

//   public render() {
//     const { user } = this.props;
//     const { newName, newAvatarUrl } = this.state;

//     return (
//       <Layout {...this.props}>
//         <Head>
//           <title>Your Settings at Async</title>
//           <meta name="description" content="description" />
//         </Head>
//         <div
//           style={{
//             padding: this.props.isMobile ? '0px' : '0px 30px',
//             fontSize: '15px',
//             height: '100%',
//           }}
//         >
//           <h3>Your Settings</h3>
//           <h4 style={{ marginTop: '40px' }}>Your account</h4>
//           <p>
//             <li>
//               Your email: <b>{user.email}</b>
//             </li>
//             <li>
//               Your name: <b>{user.displayName}</b>
//             </li>
//           </p>
//           <form onSubmit={this.onSubmit} autoComplete="off">
//             <h4>Your name</h4>
//             <TextField
//               autoComplete="off"
//               value={newName}
//               helperText="Your name as seen by your team members"
//               onChange={(event) => {
//                 this.setState({ newName: event.target.value });
//               }}
//             />
//             <br />
//             <br />
//             <Button variant="outlined" color="primary" type="submit" disabled={this.state.disabled}>
//               Update name
//             </Button>
//           </form>

//           <br />
//           <h4>Your photo</h4>
//           <Avatar
//             src={newAvatarUrl}
//             style={{
//               display: 'inline-flex',
//               verticalAlign: 'middle',
//               marginRight: 20,
//               width: 60,
//               height: 60,
//             }}
//           />
//           <label htmlFor="upload-file">
//             <Button
//               variant="outlined"
//               color="primary"
//               component="span"
//               disabled={this.state.disabled}
//             >
//               Update photo
//             </Button>
//           </label>
//           <input
//             accept="image/*"
//             name="upload-file"
//             id="upload-file"
//             type="file"
//             style={{ display: 'none' }}
//             onChange={this.uploadFile}
//           />
//           <p />
//           <br />
//         </div>
//       </Layout>
//     );
//   }

//   private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     const { newName } = this.state;

//     // const { newName, newAvatarUrl } = this.state;

//     if (!newName) {
//       notify('Name is required');
//       return;
//     }

//     NProgress.start();

//     try {
//       this.setState({ disabled: true });

//       // await updateProfile({ name: newName, avatarUrl: newAvatarUrl });
//       NProgress.done();
//       notify('You successfully updated your profile.');
//     } catch (error) {
//       NProgress.done();
//       notify(error);
//     } finally {
//       this.setState({ disabled: false });
//     }
//   };

//   private uploadFile = async () => {
//     const { user } = this.props;

//     const fileElm = document.getElementById('upload-file') as HTMLFormElement;
//     const file = fileElm.files[0];

//     if (file == null) {
//       notify('No file selected for upload.');
//       return;
//     }

//     NProgress.start();

//     fileElm.value = '';

//     const bucket = process.env.BUCKET_FOR_TEAM_AVATARS;

//     const prefix = `${user.slug}`;

//     try {
//       this.setState({ disabled: true });

//       const responseFromApiServerForUpload = await getSignedRequestForUpload({
//         file,
//         prefix,
//         bucket,
//         acl: 'public-read',
//       });

//       const resizedFile = await resizeImage(file, 128, 128);

//       await uploadFileUsingSignedPutRequest(
//         resizedFile,
//         responseFromApiServerForUpload.signedRequest,
//         {
//           'Cache-Control': 'max-age=2592000',
//         },
//       );

//       this.setState({
//         newAvatarUrl: responseFromApiServerForUpload.url,
//       });

//       // await updateProfile({
//       //   name: this.state.newName,
//       //   avatarUrl: this.state.newAvatarUrl,
//       // });

//       notify('You successfully uploaded new photo.');
//     } catch (error) {
//       notify(error);
//     } finally {
//       this.setState({ disabled: false });
//       NProgress.done();
//     }
//   };
// }

// export default YourSettings;

// ignore commented out code

// v1

// import Head from 'next/head';
// import * as React from 'react';

// import Layout from '../components/layout';

// import { getUserBySlugApiMethod } from '../lib/api/public';

// type MyProps = {
//   isMobile: boolean;
//   user: { email: string; displayName: string; slug: string; avatarUrl: string };
// };

// class YourSettings extends React.Component<MyProps> {
//   public static async getInitialProps() {
//     const slug = 'team-builder-book';

//     const user = await getUserBySlugApiMethod(slug);

//     console.log(user);

//     return { ...user };
//   }

//   public render() {
//     const { user } = this.props;

//     return (
//       <Layout {...this.props}>
//         <Head>
//           <title>Your Settings page</title>
//           <meta name="description" content="description for Your Settings page" />
//         </Head>
//         <div
//           style={{
//             padding: this.props.isMobile ? '0px' : '0px 30px',
//             fontSize: '15px',
//             height: '100%',
//           }}
//         >
//           <h3>Your Settings</h3>
//           <h4 style={{ marginTop: '40px' }}>Your account</h4>
//           <p>
//             <li>
//               Your email: <b>{user.email}</b>
//             </li>
//             <li>
//               Your name: <b>{user.displayName}</b>
//             </li>
//           </p>
//           <p />
//           <br />
//           <br />
//         </div>
//       </Layout>
//     );
//   }
// }

// export default YourSettings;

// v2

// import Head from 'next/head';
// import * as React from 'react';

// import Layout from '../components/layout';

// import { getUserBySlugApiMethod } from '../lib/api/public';

// type MyProps = {
//   isMobile: boolean;
//   user: { email: string; displayName: string; slug: string; avatarUrl: string };
// };

// type MyState = { newName: string; newAvatarUrl: string; disabled: boolean };

// class YourSettings extends React.Component<MyProps, MyState> {
//   public static async getInitialProps({ query }) {
//     const { error } = query;

//     const slug = 'team-builder-book';

//     const user = await getUserBySlugApiMethod(slug);

//     console.log(user);

//     return { ...user, error };
//   }

//   constructor(props) {
//     super(props);

//     this.state = {
//       newName: '',
//       newAvatarUrl: '',
//       disabled: false,
//     };
//   }

//   public render() {
//     const { user } = this.props;
//     const { newName, newAvatarUrl, disabled } = this.state;

//     console.log(newName);
//     console.log(newAvatarUrl);
//     console.log(disabled);

//     return (
//       <Layout {...this.props}>
//         <Head>
//           <title>Your Settings at Async</title>
//           <meta name="description" content="description" />
//         </Head>
//         <div
//           style={{
//             padding: this.props.isMobile ? '0px' : '0px 30px',
//             fontSize: '15px',
//             height: '100%',
//           }}
//         >
//           <h3>Your Settings</h3>
//           <h4 style={{ marginTop: '40px' }}>Your account</h4>
//           <p>
//             <li>
//               Your email: <b>{user.email}</b>
//             </li>
//             <li>
//               Your name: <b>{user.displayName}</b>
//             </li>
//           </p>
//           <p />
//           <br />
//         </div>
//       </Layout>
//     );
//   }
// }

// export default YourSettings;

// v3

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Head from 'next/head';
import NProgress from 'nprogress';
import * as React from 'react';

import Layout from '../components/layout';

import { getUserBySlugApiMethod, updateProfileApiMethod } from '../lib/api/public';
import {
  getSignedRequestForUploadApiMethod,
  uploadFileUsingSignedPutRequestApiMethod,
} from '../lib/api/team-member';

import { resizeImage } from '../lib/resizeImage';

import notify from '../lib/notify';

type MyProps = {
  isMobile: boolean;
  user: { email: string; displayName: string; slug: string; avatarUrl: string };
};

type MyState = { newName: string; newAvatarUrl: string; disabled: boolean };

class YourSettings extends React.Component<MyProps, MyState> {
  public static async getInitialProps() {
    const slug = 'team-builder-book';

    const user = await getUserBySlugApiMethod(slug);

    console.log(user);

    return { ...user };
  }

  constructor(props) {
    super(props);

    this.state = {
      newName: this.props.user.displayName,
      newAvatarUrl: this.props.user.avatarUrl,
      disabled: false,
    };
  }

  public render() {
    const { user } = this.props;
    const { newName, newAvatarUrl } = this.state;

    return (
      <Layout {...this.props}>
        <Head>
          <title>Your Settings at Async</title>
          <meta name="description" content="description" />
        </Head>
        <div
          style={{
            padding: this.props.isMobile ? '0px' : '0px 30px',
            fontSize: '15px',
            height: '100%',
          }}
        >
          <h3>Your Settings</h3>
          <h4 style={{ marginTop: '40px' }}>Your account</h4>
          <ul>
            <li>
              Your email: <b>{user.email}</b>
            </li>
            <li>
              Your name: <b>{user.displayName}</b>
            </li>
          </ul>
          <form onSubmit={this.onSubmit} autoComplete="off">
            <h4>Your name</h4>
            <TextField
              autoComplete="off"
              value={newName}
              helperText="Your name as seen by your team members"
              onChange={(event) => {
                this.setState({ newName: event.target.value });
              }}
            />
            <br />
            <br />
            <Button variant="outlined" color="primary" type="submit" disabled={this.state.disabled}>
              Update name
            </Button>
          </form>

          <br />
          <h4>Your photo</h4>
          <Avatar
            src={newAvatarUrl}
            style={{
              display: 'inline-flex',
              verticalAlign: 'middle',
              marginRight: 20,
              width: 60,
              height: 60,
            }}
          />
          <label htmlFor="upload-file">
            <Button
              variant="outlined"
              color="primary"
              component="span"
              disabled={this.state.disabled}
            >
              Update avatar
            </Button>
          </label>
          <input
            accept="image/*"
            name="upload-file"
            id="upload-file"
            type="file"
            style={{ display: 'none' }}
            onChange={this.uploadFile}
          />
          <p />
          <br />
        </div>
      </Layout>
    );
  }

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { newName, newAvatarUrl } = this.state;

    console.log(newName);

    if (!newName) {
      notify('Name is required');
      return;
    }

    NProgress.start();
    this.setState({ disabled: true });

    try {
      await updateProfileApiMethod({
        name: newName,
        avatarUrl: newAvatarUrl,
      });

      notify('You successfully updated your profile.');
    } catch (error) {
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

  private uploadFile = async () => {
    const fileElement = document.getElementById('upload-file') as HTMLFormElement;
    const file = fileElement.files[0];

    if (file == null) {
      notify('No file selected for upload.');
      return;
    }

    const fileName = file.name;
    const fileType = file.type;

    NProgress.start();
    this.setState({ disabled: true });

    const bucket = process.env.BUCKET_FOR_AVATARS;

    const prefix = 'team-builder-book';

    try {
      const responseFromApiServerForUpload = await getSignedRequestForUploadApiMethod({
        fileName,
        fileType,
        prefix,
        bucket,
      });

      const resizedFile = await resizeImage(file, 128, 128);

      console.log(file);
      console.log(resizedFile);

      await uploadFileUsingSignedPutRequestApiMethod(
        resizedFile,
        responseFromApiServerForUpload.signedRequest,
        { 'Cache-Control': 'max-age=2592000' },
      );

      this.setState({
        newAvatarUrl: responseFromApiServerForUpload.url,
      });

      await updateProfileApiMethod({
        name: this.state.newName,
        avatarUrl: this.state.newAvatarUrl,
      });

      notify('You successfully uploaded new avatar.');
    } catch (error) {
      notify(error);
    } finally {
      fileElement.value = '';
      this.setState({ disabled: false });
      NProgress.done();
    }
  };
}

export default YourSettings;
