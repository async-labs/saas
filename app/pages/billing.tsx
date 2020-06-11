import { observer } from 'mobx-react';
import moment from 'moment';
import Head from 'next/head';
import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import NProgress from 'nprogress';

import Layout from '../components/layout';
import notify from '../lib/notifier';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';
import { fetchCheckoutSession } from '../lib/api/team-leader';
import { STRIPEPUBLISHABLEKEY } from '../lib/consts';

const styleGrid = {
  height: '100%',
};

// const styleGridItem = {
//   padding: '0px 20px',
//   borderRight: '0.5px #707070 solid',
// };

const stripePromise = loadStripe(STRIPEPUBLISHABLEKEY);

type Props = {
  store: Store;
  isTL: boolean;
  teamSlug: string;
  isMobile: boolean;
  checkoutCanceled: boolean;
  error: string;
};
type State = { disabled: boolean; showInvoices: boolean };

class YourBilling extends React.Component<Props, State> {
  public state = {
    newName: '',
    disabled: false,
    showInvoices: false,
  };

  public static getInitialProps({ query }) {
    const { checkout_canceled, error } = query;

    return { checkoutCanceled: !!checkout_canceled, error };
  }

  public async componentDidMount() {
    if (this.props.checkoutCanceled) {
      notify('Checkout canceled');
    }

    if (this.props.error) {
      notify(this.props.error);
    }
  }

  public render() {
    const { store, isMobile } = this.props;
    const { currentTeam, currentUser } = store;
    const isTL = currentTeam && currentUser && currentUser._id === currentTeam.teamLeaderId;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
          <div style={{ padding: isMobile ? '0px' : '0px 30px', fontSize: '15px', height: '100%' }}>
            <p>You did not select any team.</p>
            <p>
              To access this page, please select existing team or create new team if you have no
              teams.
            </p>
          </div>
        </Layout>
      );
    }

    if (!isTL) {
      return (
        <Layout {...this.props}>
          <Head>
            <title>Your Billing</title>
            <meta name="description" content="description" />
          </Head>
          <div style={{ padding: isMobile ? '0px' : '0px 30px', fontSize: '15px', height: '100%' }}>
            <Grid container style={styleGrid}>
              <Grid item sm={12} xs={12} style={{ padding: '0px 20px' }}>
                <h3>Your Billing</h3>
                <p>Only Team Leader can access this page.</p>
                <p>Create your own team to become Team Leader.</p>
              </Grid>
            </Grid>
          </div>
        </Layout>
      );
    }

    return (
      <Layout {...this.props}>
        <Head>
          <title>Your Billing</title>
          <meta name="description" content="description" />
        </Head>
        <div style={{ padding: isMobile ? '0px' : '0px 30px', fontSize: '15px', height: '100%' }}>
          <Grid container style={styleGrid}>
            <Grid item sm={12} xs={12} style={{ padding: '0px 20px' }}>
              <h3>Your Billing</h3>
              <p />
              <h4 style={{ marginTop: '40px' }}>Paid plan</h4>
              {this.renderSubscriptionButton()}
              <p />
              <br />
              <h4>Card information</h4>
              {currentUser && currentUser.stripeCard ? (
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
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => this.handleCheckoutClick('setup')}
                  >
                    Update card
                  </Button>
                </span>
              ) : null}
              <p />
              <br />
              <h4>Payment history</h4>
              <Button variant="outlined" color="primary" onClick={this.showListOfInvoicesOnClick}>
                Show payment history
              </Button>
              {this.renderInvoices()}
              <p />
              <br />
            </Grid>
          </Grid>
          <br />
        </div>
      </Layout>
    );
  }

  private renderSubscriptionButton() {
    const { currentTeam, currentUser } = this.props.store;

    let subscriptionDate;
    let billingDay;
    if (currentTeam && currentTeam.stripeSubscription) {
      subscriptionDate = moment(currentTeam.stripeSubscription.billing_cycle_anchor * 1000).format(
        'MMM Do YYYY',
      );
      billingDay = moment(currentTeam.stripeSubscription.billing_cycle_anchor * 1000).format('Do');
    }

    if (
      currentTeam &&
      !currentTeam.isSubscriptionActive &&
      currentUser &&
      (!currentUser.hasCardInformation || currentTeam.isPaymentFailed)
    ) {
      return (
        <>
          <p>You are not a paying customer.</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.handleCheckoutClick('subscription')}
          >
            Buy subscription
          </Button>
          <p />
          {currentTeam.isPaymentFailed ? (
            <p>
              Team was automatically unsubscribed due to failed payment. You will be prompt to
              update card information if you choose to re-subscribe Team.
            </p>
          ) : null}
        </>
      );
    } else if (
      currentTeam &&
      !currentTeam.isSubscriptionActive &&
      currentUser &&
      currentUser.hasCardInformation &&
      !currentTeam.isPaymentFailed
    ) {
      return (
        <React.Fragment>
          <p>You are not a paying customer.</p>
          <p>
            Buy subscription using your current card, see below section for current card
            information.
          </p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.handleCheckoutClick('subscription')}
          >
            Buy subscription
          </Button>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <span>
            {' '}
            <i className="material-icons" color="action" style={{ verticalAlign: 'text-bottom' }}>
              done
            </i>{' '}
            Subscription is active.
            <p>
              You subscribed <b>{currentTeam.name}</b> on <b>{subscriptionDate}</b>.
            </p>
            <p>
              You will be billed $50 on <b>{billingDay} day</b> of each month unless you cancel
              subscription or subscription is cancelled automatically due to failed payment.
            </p>
          </span>
          <p />
          <Button variant="outlined" color="primary" onClick={this.cancelSubscriptionOnClick}>
            Unsubscribe Team
          </Button>
          <br />
        </React.Fragment>
      );
    }
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
              <React.Fragment key={i}>
                <p>Your history of payments:</p>
                <li>
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

  private handleCheckoutClick = async (mode: 'subscription' | 'setup') => {
    try {
      const { currentTeam } = this.props.store;
      const { sessionId } = await fetchCheckoutSession({ mode, teamId: currentTeam._id });

      // When the customer clicks on the button, redirect them to Checkout.
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        notify(error);
        console.error(error);
      }
    } catch (err) {
      notify(err);
      console.error(err);
    }
  };

  private cancelSubscriptionOnClick = async () => {
    const { currentTeam, currentUser } = this.props.store;

    if (!currentUser.hasCardInformation) {
      notify('You did not add payment information.');
      return;
    }

    NProgress.start();
    this.setState({ disabled: true });

    try {
      await currentTeam.cancelSubscription({ teamId: currentTeam._id });
      notify('Success!');
    } catch (err) {
      notify(err);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };
}

export default withAuth(observer(YourBilling));
