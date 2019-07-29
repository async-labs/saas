"use strict";
// 11
// import * as bodyParser from 'body-parser';
// import * as stripe from 'stripe';
// import logger from './logs';
// import Team from './models/Team';
// import {
//   STRIPE_LIVE_ENDPOINTSECRET as ENDPOINT_SECRET,
//   STRIPE_PLANID as PLAN_ID,
//   STRIPE_SECRETKEY as API_KEY,
// } from './consts';
// const stripeInstance = new stripe(API_KEY);
// function createCustomer({ token, teamLeaderEmail, teamLeaderId }) {
//   return stripeInstance.customers.create({
//     description: 'Stripe Customer at async-await.com',
//     email: teamLeaderEmail,
//     source: token,
//     metadata: {
//       teamLeaderId,
//     },
//   });
// }
// function createSubscription({ customerId, teamId, teamLeaderId }) {
//   logger.debug('stripe method is called', teamId, teamLeaderId);
//   return stripeInstance.subscriptions.create({
//     customer: customerId,
//     items: [
//       {
//         plan: PLAN_ID,
//       },
//     ],
//     metadata: {
//       teamId,
//       teamLeaderId,
//     },
//   });
// }
// function cancelSubscription({ subscriptionId }) {
//   logger.debug('cancel subscription', subscriptionId);
//   return stripeInstance.subscriptions.del(subscriptionId, { at_period_end: false });
// }
// function retrieveCard({ customerId, cardId }) {
//   logger.debug(customerId);
//   logger.debug(cardId);
//   return stripeInstance.customers.retrieveCard(customerId, cardId);
// }
// function createNewCard({ customerId, token }) {
//   logger.debug('creating new card', customerId);
//   return stripeInstance.customers.createSource(customerId, { source: token });
// }
// function updateCustomer({ customerId, newCardId }) {
//   logger.debug('updating customer', customerId);
//   return stripeInstance.customers.update(customerId, { default_source: newCardId });
// }
// function verifyWebHook(request) {
//   const event = stripeInstance.webhooks.constructEvent(
//     request.body,
//     request.headers['stripe-signature'],
//     ENDPOINT_SECRET,
//   );
//   return event;
// }
// function stripeWebHooks({ server }) {
//   server.post(
//     '/api/v1/public/stripe-invoice-payment-failed',
//     bodyParser.raw({ type: '*/*' }),
//     async (req, res, next) => {
//       try {
//         const event = await verifyWebHook(req);
//         // logger.info(JSON.stringify(event.data.object));
//         // @ts-ignore
//         // some problem with @types/stripe ?
//         const { subscription } = event.data.object;
//         // logger.info(JSON.stringify(subscription));
//         await Team.cancelSubscriptionAfterFailedPayment({
//           subscriptionId: JSON.stringify(subscription),
//         });
//         res.sendStatus(200);
//       } catch (err) {
//         next(err);
//       }
//     },
//   );
// }
// function getListOfInvoices({ customerId }) {
//   logger.debug('getting list of invoices for customer', customerId);
//   return stripeInstance.invoices.list({ customer: customerId });
// }
// export {
//   createCustomer,
//   createSubscription,
//   cancelSubscription,
//   retrieveCard,
//   createNewCard,
//   updateCustomer,
//   stripeWebHooks,
//   getListOfInvoices,
// };
//# sourceMappingURL=stripe.js.map