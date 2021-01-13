import { observer } from 'mobx-react';
import moment from 'moment';
import Head from 'next/head';
import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Button from '@material-ui/core/Button';
import NProgress from 'nprogress';

import Layout from '../components/layout';
import notify from '../lib/notify';
import { Store } from '../lib/store';
import withAuth from '../lib/withAuth';
import { fetchCheckoutSessionApiMethod } from '../lib/api/team-leader';

const dev = process.env.NODE_ENV !== 'production';

const stripePromise = loadStripe(
  dev ? process.env.STRIPE_TEST_PUBLISHABLEKEY : process.env.STRIPE_LIVE_PUBLISHABLEKEY,
);

type Props = {
  store: Store;
  isMobile: boolean;
  teamSlug: string;
  redirectMessage?: string;
};

type State = { disabled: boolean; showInvoices: boolean };

class Billing extends React.Component<Props, State> {
  public state = { disabled: false, showInvoices: false };

  public render() {
    const { store, isMobile } = this.props;
    const { currentTeam, currentUser } = store;
    const isTeamLeader = currentTeam && currentUser && currentUser._id === currentTeam.teamLeaderId;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
          <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
            <p>You did not select any team.</p>
            <p>
              To access this page, please select existing team or create new team if you have no
              teams.
            </p>
          </div>
        </Layout>
      );
    }

    if (!isTeamLeader) {
      return (
        <Layout {...this.props}>
          <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
            <p>Only the Team Leader can access this page.</p>
            <p>Create your own team to become a Team Leader.</p>
          </div>
        </Layout>
      );
    }

    return (
      <Layout {...this.props}>
        <Head>
          <title>Your Billing</title>
        </Head>
        <div style={{ padding: isMobile ? '0px' : '0px 30px' }}>
          <h3>Your Billing</h3>
          <p />
          <h4 style={{ marginTop: '40px' }}>Paid plan</h4>
          {this.renderSubscriptionButton()}
          <p />
          <br />
          <h4>Card information</h4>
          {this.renderCardInfo()}
          <p />
          <br />
          <h4>Payment history</h4>
          <Button
            variant="outlined"
            color="primary"
            onClick={this.showListOfInvoicesOnClick}
            disabled={this.state.disabled}
          >
            Show payment history
          </Button>
          <p />
          {this.renderInvoices()}
          <p />
          <br />
        </div>
      </Layout>
    );
  }

  public async componentDidMount() {
    if (this.props.redirectMessage) {
      notify(this.props.redirectMessage);
    }
  }

  private renderSubscriptionButton() {
    const { currentTeam } = this.props.store;

    let subscriptionDate;
    let billingDay;
    if (currentTeam && currentTeam.stripeSubscription) {
      subscriptionDate = moment(currentTeam.stripeSubscription.billing_cycle_anchor * 1000).format(
        'MMM Do YYYY',
      );
      billingDay = moment(currentTeam.stripeSubscription.billing_cycle_anchor * 1000).format('Do');
    }

    if (currentTeam && !currentTeam.isSubscriptionActive && currentTeam.isPaymentFailed) {
      return (
        <>
          <p>You are not a paying customer.</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.handleCheckoutClick('subscription')}
            disabled={this.state.disabled}
          >
            Buy subscription
          </Button>
          <p />
          <p>
            Team was automatically unsubscribed due to failed payment. You will be prompt to update
            card information if you choose to re-subscribe Team.
          </p>
        </>
      );
    } else if (currentTeam && !currentTeam.isSubscriptionActive && !currentTeam.isPaymentFailed) {
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
            disabled={this.state.disabled}
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
          <Button
            variant="outlined"
            color="primary"
            onClick={this.cancelSubscriptionOnClick}
            disabled={this.state.disabled}
          >
            Unsubscribe Team
          </Button>
          <br />
        </React.Fragment>
      );
    }
  }

  private handleCheckoutClick = async (mode: 'subscription' | 'setup') => {
    try {
      const { currentTeam } = this.props.store;

      NProgress.start();
      this.setState({ disabled: true });

      const { sessionId } = await fetchCheckoutSessionApiMethod({ mode, teamId: currentTeam._id });

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
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };

  private cancelSubscriptionOnClick = async () => {
    const { currentTeam } = this.props.store;

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

  private renderCardInfo() {
    const { currentUser } = this.props.store;

    if (currentUser && currentUser.hasCardInformation) {
      return (
        <span>
          {' '}
          <i className="material-icons" color="action" style={{ verticalAlign: 'text-bottom' }}>
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
            disabled={this.state.disabled}
          >
            Update card
          </Button>
        </span>
      );
    } else {
      return 'You have not added a card.';
    }
  }

  private renderInvoices() {
    const { currentUser } = this.props.store;
    const { showInvoices } = this.state;

    if (!showInvoices) {
      return null;
    }

    if (currentUser && currentUser.stripeCard) {
      return (
        <React.Fragment>
          {currentUser.stripeListOfInvoices.data.map((invoice, i) => (
            <React.Fragment key={i}>
              <p>Your history of payments:</p>
              <li>
                ${invoice.amount_paid / 100} was paid on{' '}
                {moment(invoice.created * 1000).format('MMM Do YYYY')} for Team '{invoice.teamName}'
                -{' '}
                <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                  See invoice
                </a>
              </li>
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    } else {
      return 'You have no history of payments.';
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
}

export default withAuth(observer(Billing));
