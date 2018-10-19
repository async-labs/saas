import { observer } from 'mobx-react';
import moment from 'moment';
import Head from 'next/head';
import * as React from 'react';

import StripeCheckout from 'react-stripe-checkout';

import Grid from '@material-ui/core/Grid';

import Button from '@material-ui/core/Button';
import NProgress from 'nprogress';
import SettingList from '../../components/common/SettingList';
import Layout from '../../components/layout';
import env from '../../lib/env';
import notify from '../../lib/notifier';
import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';

const { StripePublishableKey } = env;

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #707070 solid',
};

type Props = { store: Store; isTL: boolean; teamSlug: string };
type State = { disabled: boolean; showInvoices: boolean };

class TeamBilling extends React.Component<Props, State> {
  public state = {
    newName: '',
    disabled: false,
    showInvoices: false,
  };

  public render() {
    const { store } = this.props;
    const { currentTeam, currentUser } = store;
    const isTL = currentTeam && currentUser && currentUser._id === currentTeam.teamLeaderId;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <Layout {...this.props}>
          <div style={{ padding: '20px' }}>
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
          <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
            <Head>
              <title>Team Billing</title>
              <meta name="description" content="description" />
            </Head>
            <Grid container style={styleGrid}>
              <Grid item sm={2} xs={12} style={styleGridItem}>
                <SettingList store={store} isTeamSettings={true} />
              </Grid>
              <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
                <h3>Team Billing</h3>
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
          <title>Team Billing</title>
          <meta name="description" content="description" />
        </Head>
        <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTeamSettings={true} />
            </Grid>
            <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
              <h3>Team Billing</h3>
              <p />
              <h4 style={{ marginTop: '40px' }}>Team Subscription</h4>
              {this.renderSubscriptionButton()}
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
                  <Button variant="contained" color="primary">
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
                    name="Add new card information"
                    email={currentUser.email}
                    allowRememberMe={false}
                    panelLabel="Update card"
                    description={'New card will be your default card.'}
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
              <p />
              <br />
            </Grid>
          </Grid>
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
        <StripeCheckout
          stripeKey={StripePublishableKey}
          token={this.addCard}
          name="Buy subscription"
          email={this.props.store.currentUser.email}
          allowRememberMe={false}
          panelLabel="Confirm ($50/month)"
          description={`Subscription for ${currentTeam.name}`}
        >
          <Button variant="contained" color="primary">
            Buy subscription (has no card)
          </Button>
          <p />
          {currentTeam.isPaymentFailed ? (
            <p>
              Team was automatically unsubscribed due to failed payment. You will be prompt to
              update card information if you choose to re-subscribe Team.
            </p>
          ) : null}
        </StripeCheckout>
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
          <Button variant="contained" color="primary" onClick={this.createSubscriptionOnClick}>
            Buy subscription (has card)
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
              You will be billed on <b>{billingDay} day</b> of each month unless you cancel
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
    const { currentUser, currentTeam } = this.props.store;

    NProgress.start();
    this.setState({ disabled: true });

    try {
      await currentUser.createCustomer({ token });
      await currentTeam.createSubscription({ teamId: currentTeam._id });
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

  private createSubscriptionOnClick = async () => {
    const { currentTeam, currentUser } = this.props.store;

    if (!currentUser.hasCardInformation) {
      notify('You did not add payment information.');
      return;
    }

    NProgress.start();
    this.setState({ disabled: true });

    try {
      await currentTeam.createSubscription({ teamId: currentTeam._id });
      notify('Success!');
    } catch (err) {
      notify(err);
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
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

export default withAuth(observer(TeamBilling));
