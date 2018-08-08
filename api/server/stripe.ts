import * as bodyParser from 'body-parser';
import * as stripe from 'stripe';
import logger from './logs';

const dev = process.env.NODE_ENV !== 'production';

const API_KEY = dev ? process.env.Stripe_Test_SecretKey : process.env.Stripe_Live_SecretKey;
const PLAN_ID = dev ? process.env.Stripe_Test_PlanId : process.env.Stripe_Live_PlanId;
const ENDPOINT_SECRET = process.env.Stripe_Live_EndpointSecret;

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

function verifyWebHook(request) {
  const event = stripeInstance.webhooks.constructEvent<any>(
    request.body,
    request.headers['stripe-signature'],
    ENDPOINT_SECRET,
  );
  return event;
}

function stripeWebHooks({ server }) {
  server.post(
    '/api/v1/public/stripe-invoice-payment-failed',
    bodyParser.raw({ type: '*/*' }),
    async (req, res, next) => {
      try {
        const event = await verifyWebHook(req);
        logger.info(event.id);
        const { customer } = event.data.object;
        logger.info(JSON.stringify(customer));
        // backend logic for failed payment for subscription

        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );
}

export {
  createCustomer,
  createSubscription,
  cancelSubscription,
  retrieveCard,
  createNewCard,
  updateCustomer,
  stripeWebHooks,
};
