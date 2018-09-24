import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Head from 'next/head';
import NProgress from 'nprogress';
import * as React from 'react';
import StripeCheckout from 'react-stripe-checkout';

import env from '../../lib/env';

import moment from 'moment';

import {
  getSignedRequestForUpload,
  uploadFileUsingSignedPutRequest,
} from '../../lib/api/team-member';

import notify from '../../lib/notifier';
import { resizeImage } from '../../lib/resizeImage';
import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';

const { StripePublishableKey } = env;

const styleGrid = {
  height: '100%',
};

type MyProps = { store: Store; isTL: boolean; error?: string };
type MyState = { newName: string; newAvatarUrl: string; disabled: boolean; showInvoices: boolean };

class YourProfile extends React.Component<MyProps, MyState> {
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
      showInvoices: false,
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
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Your Profile at Async</title>
          <meta name="description" content="description" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={12} xs={12} style={{ padding: '0px 20px' }}>
            <h3>Your Profile</h3>
            <h4 style={{ marginTop: '40px' }}>Your account</h4>
            <p>
              <i className="material-icons" color="action" style={{ verticalAlign: 'text-bottom' }}>
                done
              </i>{' '}
              You signed up on Async using your Google account.
              <li>
                {' '}
                Your Google/Async email: <b>{currentUser.email}</b>
              </li>
              <li>
                Your Google/Async username: <b>{currentUser.displayName}</b>
              </li>
            </p>
            <form onSubmit={this.onSubmit} autoComplete="off">
              <h4>Your name</h4>
              <TextField
                autoComplete="off"
                value={newName}
                helperText="Your name as seen by your team members"
                onChange={event => {
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
            <h4>Card information</h4>
            {currentUser && !currentUser.stripeCard ? (
              <StripeCheckout
                stripeKey={StripePublishableKey}
                token={this.addCard}
                name="Add card information"
                email={currentUser.email}
                allowRememberMe={false}
                panelLabel="Add card"
                description={'This is your default payment method.'}
              >
                <Button variant="raised" color="primary">
                  Add card
                </Button>
              </StripeCheckout>
            ) : (
              <span>
                {' '}
                <i
                  className="material-icons"
                  color="action"
                  style={{ verticalAlign: 'text-bottom' }}
                >
                  done
                </i>{' '}
                Your default payment method:
                <li>
                  {currentUser.stripeCard.brand}, {currentUser.stripeCard.funding} card
                </li>
                <li>Last 4 digits: *{currentUser.stripeCard.last4}</li>
                <li>
                  Expiration: {currentUser.stripeCard.exp_month}/{currentUser.stripeCard.exp_year}
                </li>
                <p />
                <StripeCheckout
                  stripeKey={StripePublishableKey}
                  token={this.addNewCardOnClick}
                  name="Add new card"
                  email={currentUser.email}
                  allowRememberMe={false}
                  panelLabel="Update card"
                  description={'New card will be your default payment method.'}
                >
                  <Button variant="outlined" color="primary">
                    Update card
                  </Button>
                </StripeCheckout>
              </span>
            )}
            <p />
            <br />
            <h4>Payment history</h4>
            <Button variant="outlined" color="primary" onClick={this.showListOfInvoicesOnClick}>
              Show payment history
            </Button>
            {this.renderInvoices()}
            <br />
          </Grid>
        </Grid>
      </div>
    );
  }

  private showListOfInvoicesOnClick = async () => {
    const { currentUser } = this.props.store;
    NProgress.start();
    this.setState({ disabled: true });
    try {
      await currentUser.getListOfInvoices();
      this.setState({ showInvoices: true });
    } catch (err) {
      notify(err);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

  private renderInvoices() {
    const { currentUser } = this.props.store;
    const { showInvoices } = this.state;
    if (!showInvoices) {
      return null;
    }
    return (
      <React.Fragment>
        {currentUser && !currentUser.stripeListOfInvoices ? (
          <React.Fragment>
            <p>You have no history of payments.</p>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {currentUser.stripeListOfInvoices.data.map((invoice, i) => (
              <React.Fragment>
                <p>Your history of payments:</p>
                <li key={i}>
                  ${invoice.amount_paid / 100} was paid on{' '}
                  {moment(invoice.date * 1000).format('MMM Do YYYY')} for Team '{invoice.teamName}'
                  -{' '}
                  <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                    See invoice
                  </a>
                </li>
              </React.Fragment>
            ))}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  private addCard = async token => {
    const { currentUser } = this.props.store;

    NProgress.start();
    this.setState({ disabled: true });

    try {
      await currentUser.createCustomer({ token });
      notify('Success!');
    } catch (err) {
      notify(err);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

  private addNewCardOnClick = async token => {
    const { currentUser } = this.props.store;

    NProgress.start();
    this.setState({ disabled: true });

    try {
      await currentUser.createNewCardAndUpdateCustomer({ token });
      notify('You successfully updated card information.');
    } catch (err) {
      notify(err);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

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

    const file = document.getElementById('upload-file').files[0];
    document.getElementById('upload-file').value = '';
    const bucket = 'saas-teams-avatars';
    const prefix = `${currentUser.slug}`;

    if (file == null) {
      return notify('No file selected.');
    }

    NProgress.start();

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

export default withAuth(withLayout(YourProfile, { teamRequired: false }));
