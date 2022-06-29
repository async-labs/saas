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

type Props = {
  isMobile: boolean;
  user: { email: string; displayName: string; slug: string; avatarUrl: string };
};

type State = { newName: string; newAvatarUrl: string; disabled: boolean };

class YourSettings extends React.Component<Props, State> {
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
              Your username: <b>{user.displayName}</b>
            </li>
          </ul>
          <form onSubmit={this.onSubmit} autoComplete="off">
            <h4>Your username</h4>
            <TextField
              autoComplete="off"
              value={newName}
              helperText="Your username as seen by your team members"
              onChange={(event) => {
                this.setState({ newName: event.target.value });
              }}
            />
            <br />
            <br />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={this.state.disabled}
            >
              Update username
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
          <label htmlFor="upload-file-user-avatar">
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
            name="upload-file-user-avatar"
            id="upload-file-user-avatar"
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
    const fileElement = document.getElementById('upload-file-user-avatar') as HTMLFormElement;
    const file = fileElement.files[0];

    if (file == null) {
      notify('No file selected for upload.');
      return;
    }

    const fileName = file.name;
    const fileType = file.type;

    NProgress.start();
    this.setState({ disabled: true });

    const bucket = process.env.NEXT_PUBLIC_BUCKET_FOR_AVATARS;

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
