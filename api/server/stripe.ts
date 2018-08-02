import * as stripe from 'stripe';
import logger from './logs';

const dev = process.env.NODE_ENV !== 'production';

const API_KEY = dev ? process.env.Stripe_Test_SecretKey : process.env.Stripe_Live_SecretKey;
const PLAN_ID = dev ? process.env.Stripe_Test_PlanId : process.env.Stripe_Live_PlanId;

const stripeInstance = new stripe(API_KEY);

function createCustomer({ token, teamLeaderEmail, teamLeaderId }) {
  return stripeInstance.customers.create({
    description: 'Stripe Customer at async-await.com',
    email: teamLeaderEmail,
    source: token,
    metadata: {
      teamLeaderId,
    },
  });
}

function createSubscription({ customerId, teamId, teamLeaderId }) {
  logger.debug('stripe method is called', teamId, teamLeaderId);
  return stripeInstance.subscriptions.create({
    customer: customerId,
    items: [
      {
        plan: PLAN_ID,
      },
    ],
    metadata: {
      teamId,
      teamLeaderId,
    },
  });
}

function cancelSubscription({ subscriptionId }) {
  logger.debug('cancel subscription', subscriptionId);
  return stripeInstance.subscriptions.del(subscriptionId, { at_period_end: false });
}

function retrieveCard({ customerId, cardId }) {
  logger.debug(customerId);
  logger.debug(cardId);
  return stripeInstance.customers.retrieveCard(customerId, cardId);
}

function createNewCard({ customerId, token }) {
  logger.debug('creating new card', customerId);
  return stripeInstance.customers.createSource(customerId, { source: token });
}

function updateCustomer({ customerId, newCardId }) {
  logger.debug('updating customer', customerId);
  return stripeInstance.customers.update(customerId, { default_source: newCardId });
}

export {
  createCustomer,
  createSubscription,
  cancelSubscription,
  retrieveCard,
  createNewCard,
  updateCustomer,
};
