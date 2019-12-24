import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Head from 'next/head';
import NProgress from 'nprogress';
import * as React from 'react';

import Layout from '../components/layout';

import { getSignedRequestForUpload, uploadFileUsingSignedPutRequest } from '../lib/api/team-member';

import notify from '../lib/notifier';
import { resizeImage } from '../lib/resizeImage';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';

// 10
// import { BUCKET_FOR_TEAM_AVATARS } from '../lib/consts';

const styleGrid = {
  height: '100%',
};

type MyProps = { store: Store; isTL: boolean; error?: string; isMobile: boolean };
type MyState = { newName: string; newAvatarUrl: string; disabled: boolean };

class YourSettings extends React.Component<MyProps, MyState> {
  public static getInitialProps({ query }) {
    const { error } = query;

    return { error };
  }

  constructor(props) {
    super(props);

    this.state = {
      newName: this.props.store.currentUser.displayName,
      newAvatarUrl: this.props.store.currentUser.avatarUrl,
      disabled: false,
    };
  }

  public componentDidMount() {
    const { error } = this.props;

    if (error) {
      notify(error);
    }
  }

  public render() {
    const { currentUser } = this.props.store;
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
          <Grid container style={styleGrid}>
            <Grid item sm={12} xs={12} style={{ padding: '0px 20px' }}>
              <h3>Your Settings</h3>
              <h4 style={{ marginTop: '40px' }}>Your account</h4>
              <p>
                <i
                  className="material-icons"
                  color="action"
                  style={{ verticalAlign: 'text-bottom' }}
                >
                  done
                </i>{' '}
                {currentUser.isSignedupViaGoogle
                  ? 'You signed up on Async using your Google account.'
                  : 'You signed up on Async using your email.'}
                <li>
                  {' '}
                  Your email: <b>{currentUser.email}</b>
                </li>
                <li>
                  Your name: <b>{currentUser.displayName}</b>
                </li>
              </p>
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
                <Button
                  variant="outlined"
                  color="primary"
                  type="submit"
                  disabled={this.state.disabled}
                >
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
                  Update photo
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
            </Grid>
          </Grid>
          <br />
        </div>
      </Layout>
    );
  }

  private onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { currentUser } = this.props.store;

    const { newName, newAvatarUrl } = this.state;

    if (!newName) {
      notify('Name is required');
      return;
    }

    NProgress.start();

    try {
      this.setState({ disabled: true });

      await currentUser.updateProfile({ name: newName, avatarUrl: newAvatarUrl });
      NProgress.done();
      notify('You successfully updated your profile.');
    } catch (error) {
      NProgress.done();
      notify(error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  private uploadFile = async () => {
    const { store } = this.props;
    const { currentUser } = store;

    const fileElm = document.getElementById('upload-file') as HTMLFormElement;
    const file = fileElm.files[0];

    if (file == null) {
      notify('No file selected for upload.');
      return;
    }

    NProgress.start();

    fileElm.value = '';

    const bucket = 'saas-users-avatars';

    // 10
    // const bucket = BUCKET_FOR_TEAM_AVATARS;

    const prefix = `${currentUser.slug}`;

    try {
      this.setState({ disabled: true });

      const responseFromApiServerForUpload = await getSignedRequestForUpload({
        file,
        prefix,
        bucket,
        acl: 'public-read',
      });

      const resizedFile = await resizeImage(file, 128, 128);

      await uploadFileUsingSignedPutRequest(
        resizedFile,
        responseFromApiServerForUpload.signedRequest,
        {
          'Cache-Control': 'max-age=2592000',
        },
      );

      this.setState({
        newAvatarUrl: responseFromApiServerForUpload.url,
      });

      await currentUser.updateProfile({
        name: this.state.newName,
        avatarUrl: this.state.newAvatarUrl,
      });

      notify('You successfully uploaded new photo.');
    } catch (error) {
      notify(error);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };
}

export default withAuth(YourSettings);

// 10
// export default withAuth(YourSettings, { teamRequired: false });
