import { observer } from 'mobx-react';
import moment from 'moment';
import Head from 'next/head';
import * as React from 'react';

import StripeCheckout from 'react-stripe-checkout';

import Grid from '@material-ui/core/Grid';

import Button from '@material-ui/core/Button';
import NProgress from 'nprogress';
import SettingList from '../../components/common/SettingList';
import env from '../../lib/env';
import notify from '../../lib/notifier';
import { Store } from '../../lib/store';
import withAuth from '../../lib/withAuth';
import withLayout from '../../lib/withLayout';

const { StripePublishableKey } = env;

const styleGrid = {
  height: '100%',
};

const styleGridItem = {
  padding: '0px 20px',
  borderRight: '0.5px #707070 solid',
};

type Props = { store: Store; isTL: boolean; teamSlug: string };
type State = { disabled: boolean; };

class TeamBilling extends React.Component<Props, State> {
  public state = {
    newName: '',
    disabled: false,
  };

  public render() {
    const { store, isTL } = this.props;
    const { currentTeam } = store;

    if (!currentTeam || currentTeam.slug !== this.props.teamSlug) {
      return (
        <div style={{ padding: '20px' }}>
          <p>You did not select any team.</p>
          <p>
            To access this page, please select existing team or create new team if you have no
            teams.
          </p>
        </div>
      );
    }

    if (!isTL) {
      return (
        <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
          <Head>
            <title>Team Billing</title>
            <meta name="description" content="description" />
          </Head>
          <Grid container style={styleGrid}>
            <Grid item sm={2} xs={12} style={styleGridItem}>
              <SettingList store={store} isTL={isTL} />
            </Grid>
            <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
              <h3>Team Billing</h3>
              <p>Only Team Leader can access this page.</p>
              <p>Create your own team to become Team Leader.</p>
            </Grid>
          </Grid>
        </div>
      );
    }

    return (
      <div style={{ padding: '0px', fontSize: '14px', height: '100%' }}>
        <Head>
          <title>Team Billing</title>
          <meta name="description" content="description" />
        </Head>
        <Grid container style={styleGrid}>
          <Grid item sm={2} xs={12} style={styleGridItem}>
            <SettingList store={store} isTL={isTL} />
          </Grid>
          <Grid item sm={10} xs={12} style={{ padding: '0px 20px' }}>
            <h3>Team Billing</h3>
            <p />
            {this.renderSubscriptionButton()}
            <p />
          </Grid>
        </Grid>
      </div>
    );
  }

  private renderSubscriptionButton() {
    const { currentTeam, currentUser } = this.props.store;

    let subscriptionDate;
    let billingDay;
    if (currentTeam && currentTeam.stripeSubscription) {
      subscriptionDate = moment(currentTeam.stripeSubscription.billing_cycle_anchor * 1000).format('MMM Do YYYY');
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
          <Button variant="raised" color="primary">
            Buy subscription
          </Button>
          <p />
          {currentTeam.isPaymentFailed ? (
            <p>
              Team was automatically unsubscribed due to failed payment. You
              will be prompt to update card information if you choose to
              re-subscribe Team.
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
          <Button
            variant="raised"
            color="primary"
            onClick={this.createSubscriptionOnClick}
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
            <i
              className="material-icons"
              color="action"
              style={{ verticalAlign: 'text-bottom' }}
            >
              done
            </i>{' '}
            Subscription is active.
            <p>
              You subscribed <b>{currentTeam.name}</b> on{' '}
              <b>{subscriptionDate}</b>.
            </p>
            <p>
              You will be billed on <b>{billingDay} day</b> of each month unless you
              cancel subscription or subscription is cancelled automatically due to failed payment.
            </p>
          </span>
          <p />
          <Button
            variant="outlined"
            color="primary"
            onClick={this.cancelSubscriptionOnClick}
          >
            Unsubscribe Team
          </Button>
          <p />
        </React.Fragment>
      );
    }
  }

  private addCard = async token => {
    const { currentTeam, currentUser } = this.props.store;

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

export default withAuth(withLayout(observer(TeamBilling)));
